var ENGINE = ENGINE || {};

/*
 *  This code was done by ondras https://github.com/ondras/rot.js/blob/master/src/rng.js
 *  This code is an implementation of Alea algorithm; (C) 2010 Johannes Baagøe.
 */
ENGINE.RAND = {
	_s0: 0,
	_s1: 0,
	_s2: 0,
	_c: 0,
	_frac: 2.3283064365386963e-10,
	/* 2^-32 */
	getSeed: function() {
		return this._seed;
	},
	setSeed: function(seed) {
		seed = (seed < 1 ? 1 / seed : seed);
		this._seed = seed;
		this._s0 = (seed >>> 0) * this._frac;
		seed = (seed * 69069 + 1) >>> 0;
		this._s1 = seed * this._frac;
		seed = (seed * 69069 + 1) >>> 0;
		this._s2 = seed * this._frac;
		this._c = 1;
		return this;
	},
	getUniform: function() {
		var t = 2091639 * this._s0 + this._c * this._frac;
		this._s0 = this._s1;
		this._s1 = this._s2;
		this._c = t | 0;
		this._s2 = t - this._c;
		return this._s2;
	},
	getUniformInt: function(lowerBound, upperBound) {
		var max = Math.max(lowerBound, upperBound);
		var min = Math.min(lowerBound, upperBound);
		return Math.floor(this.getUniform() * (max - min + 1)) + min;
	},
	getNormal: function(mean, stddev) {
		do {
			var u = 2 * this.getUniform() - 1;
			var v = 2 * this.getUniform() - 1;
			var r = u * u + v * v;
		} while (r > 1 || r == 0);

		var gauss = u * Math.sqrt(-2 * Math.log(r) / r);
		return (mean || 0) + gauss * (stddev || 1);
	},
	getPercentage: function() {
		return 1 + Math.floor(this.getUniform() * 100);
	},
	getWeightedValue: function(data) {
		var avail = [];
		var total = 0;

		for (var id in data) {
			total += data[id];
		}
		var random = Math.floor(this.getUniform() * total);

		var part = 0;
		for (var id in data) {
			part += data[id];
			if (random < part) {
				return id;
			}
		}

		return null;
	},
	getState: function() {
		return [this._s0, this._s1, this._s2, this._c];
	},
	setState: function(state) {
		this._s0 = state[0];
		this._s1 = state[1];
		this._s2 = state[2];
		this._c = state[3];
		return this;
	},
};

ENGINE.EVENT = {
	eventsList: ['New Lair', 'Caravan arrived', 'Adventurer arrived'],
	events: {
		'New Day': {
			local: true,
			major: true,
			name: 'New Day',
			text: 'New day has come.',
			getMinors: true,
			func: function() {
				ENGINE.TIMER.putEvent(ENGINE.EVENT.newEvent('New Day'), 30);
			},
		},
		'New Lair': {
			local: false,
			major: false,
			name: 'New Lair',
			text: 'Something gone wrong.',
			func: function(){
				var lair = new ENGINE.LAIR();
				this.text = lair.appearText();
				ENGINE.WORLD.LAIRS.Active.push(lair);
			},
		},
		'Caravan arrived': {
			local: true,
			major: true,
			name: 'Caravan arrived',
			text: 'Caravan with goods arrived.'
		},
		'Adventurer arrived': {
			local: true,
			major: false,
			name: 'Adventurer arrived',
			text: 'Some vagabond has arrived.'
		},
	},
	newEvent: function(name) {
		var opts = this.events[name];
		return clone(opts);
	},
	newRandomEvent: function() {
		var i = ENGINE.RAND.getUniformInt(0, this.eventsList.length - 1);
		return this.newEvent(this.eventsList[i]);
	},
};

ENGINE.TIMER = {
	time: 5,
	day: 1,

	events: [ENGINE.EVENT.newEvent('New Day')],
	eventsTimes: [6],

	minorQueue: [],

	checkDay: function() {
		if (this.time == 24) {
			this.time = 0;
			this.day++;
			for (var i = 0; i < this.eventsTimes.length; i++) {
				this.eventsTimes[i] -= 24;
			};
		}
	},
	putEvent: function(event, time) {
		var indx = this.events.length;
		for (var i = 0; i < this.eventsTimes.length; i++) {
			if (this.eventsTimes[i] > time) {
				indx = i;
				break;
			};
		};

		this.eventsTimes.splice(indx, 0, time);
		this.events.splice(indx, 0, event);
	},
	progressTime: function() {
		var doing = [];
		var ret = [];

		this.time++;

		for (var i = 0; i < this.eventsTimes.length; i++) {
			if (this.eventsTimes[i] <= this.time) {
				doing.push(this.events[i]);
			}
		}

		this.eventsTimes.splice(0, doing.length);
		this.events.splice(0, doing.length);

		for (var i = 0; i < doing.length; i++) {
			doing[i].time = this.time;
			doing[i].day = this.day;
			if (doing[i].func) {
				doing[i].func();
				doing[i].func = null;
			}
			if (doing[i].major === false && (this.time < 6 || this.time > 24)) {
				this.minorQueue.push(doing[i]);
			} else {
				ret.push(doing[i]);
			}

			if (doing[i].getMinors) {
				for (var i = 0; i < this.minorQueue.length; i++) {
					ret.push(this.minorQueue[i]);
				};
				this.minorQueue = [];
			}
		};

		this.checkDay();
		return ret;
	},
	nextEvents: function() {
		var ret = [];
		do {
			ret = this.progressTime();
		} while (ret.length == 0)
		return ret;
	},
	getTime: function() {
		return {
			d: this.day,
			t: this.time
		};
	},
	getEventsTimes: function() {
		var ret = {};
		for (var i = 0; i < this.eventsTimes.length; i++) {
			if (!ret[this.eventsTimes[i]])
				ret[this.eventsTimes[i]] = [];
			ret[this.eventsTimes[i]].push(this.events[i].name);
		};
		return ret;
	},
};

ENGINE.LAIR = function(){
	this.race = 'human';
	this.enemy = 'bandit';
	this.type = 'hideout';
	this.many = ENGINE.RAND.getUniformInt(1,3);
	this.diff = this.many * ENGINE.RAND.getUniformInt(1,3);

	return this;
}

ENGINE.LAIR.prototype.appearText = function() {
	return 'Some '+this.race+' '+this.enemy+(this.many==1?'':'s')+' holed up in some '+this.enemy+' '+this.type+'.';
};

ENGINE.WORLD = {};

ENGINE.WORLD.LAIRS = {
	Active: [],
	Closed: [],
};

ENGINE.WORLD.TAVERN = {
	gold: 0,
	supplies: {},
	guests: {
		caravans: {},
		adventurers: {},
		locals: {},
	},
	workers: {
		stableboy: 'Larry',
		blacksmith: 'John',
		wench: 'Amelia',
		housewife: 'Aghata',
		owner: 'Largin',
		daughter: 'Aegia',
		son: 'Gustaf',
	},
};

ENGINE.process = function(e) {
	var data = e.data;
	var action = data.action
	var ret = {};

	switch (action.who) {
		case 'time':
			switch (action.what) {
				case 'nextEvents':
					ret.events = this.TIMER.nextEvents();
					break;
				case 'progressTime':
					ret.events = this.TIMER.progressTime();
					break;
			}
			ret.time = this.TIMER.getTime();
			ret.debug = this.TIMER.getEventsTimes();
			ret.world = this.WORLD;
			break;
		default:
			break;
	}
	self.postMessage(ret);
};

ENGINE.init = function() {
	ENGINE.RAND.setSeed(Date.now());

	for (var i = 0; i < 12; i++) {
		var ev = ENGINE.EVENT.newRandomEvent();
		ENGINE.TIMER.putEvent(ev, ENGINE.RAND.getUniformInt(24, 48));
	};

	self.addEventListener('message', this.process.bind(this), false);
};

function clone(obj) {
	var copy;

	// Handle the 3 simple types, and null or undefined
	if (null == obj || "object" != typeof obj) return obj;

	// Handle Date
	if (obj instanceof Date) {
		copy = new Date();
		copy.setTime(obj.getTime());
		return copy;
	}

	// Handle Array
	if (obj instanceof Array) {
		copy = [];
		for (var i = 0, len = obj.length; i < len; i++) {
			copy[i] = clone(obj[i]);
		}
		return copy;
	}

	// Handle Object
	if (obj instanceof Object) {
		copy = {};
		for (var attr in obj) {
			if (obj.hasOwnProperty(attr)) copy[attr] = clone(obj[attr]);
		}
		return copy;
	}

	throw new Error("Unable to copy obj! Its type isn't supported.");
};


ENGINE.init();