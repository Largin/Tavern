var ENGINE = {
	/*
	*  This code was done by ondras https://github.com/ondras/rot.js/blob/master/src/rng.js
	*  This code is an implementation of Alea algorithm; (C) 2010 Johannes Baagøe.
	*/
	RAND: {
		_s0: 0,
		_s1: 0,
		_s2: 0,
		_c: 0,
		_frac: 2.3283064365386963e-10, /* 2^-32 */
		getSeed: function() {
			return this._seed;
		},
		setSeed: function(seed) {
			seed = (seed < 1 ? 1/seed : seed);
			this._seed = seed;
			this._s0 = (seed >>> 0) * this._frac;
			seed = (seed*69069 + 1) >>> 0;
			this._s1 = seed * this._frac;
			seed = (seed*69069 + 1) >>> 0;
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
				var u = 2*this.getUniform()-1;
				var v = 2*this.getUniform()-1;
				var r = u*u + v*v;
			} while (r > 1 || r == 0);

			var gauss = u * Math.sqrt(-2*Math.log(r)/r);
			return (mean || 0) + gauss*(stddev || 1);
		},
		getPercentage: function() {
			return 1 + Math.floor(this.getUniform()*100);
		},
		getWeightedValue: function(data) {
			var avail = [];
			var total = 0;

			for (var id in data) {
				total += data[id];
			}
			var random = Math.floor(this.getUniform()*total);

			var part = 0;
			for (var id in data) {
				part += data[id];
				if (random < part) { return id; }
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
			this._c  = state[3];
			return this;
		},
	},

	TIMER: {
		time: 0,
		events: ['New Day'],
		eventsTimes: [24],
		putEvent: function(event, time){
			var indx = this.events.length;
			for (var i = 0; i < this.eventsTimes.length; i++) {
				if(this.eventsTimes[i] > time){
					indx = i;
					break;
				}
			};

			this.eventsTimes.splice(indx, 0, time);
			this.events.splice(indx, 0, event);
		},
		progressTime: function(){
			var ret = [];
			this.time++;
			for (var i = 0; i < this.eventsTimes.length; i++) {
				if(this.eventsTimes[i] <= this.time){
					ret.push(this.events[i]);
				}
			}
			this.eventsTimes.splice(0, ret.length);
			this.events.splice(0, ret.length);

			this.checkDay();
			return ret;
		},
		nextEvents: function(){
			var ret = [];
			do {
				ret = this.progressTime();
			} while(ret.length == 0)
			return ret;
		},
		getTime: function(){
			return this.time;
		},
		checkDay: function(){
			if(this.time == 24){
				this.time = 0;
				for (var i = 0; i < this.eventsTimes.length; i++) {
					this.eventsTimes[i] -= 24;
				};
				this.putEvent('New Day', 24);
			}
		},
	},

	process: function(e){
		var data = e.data;
		var action = data.action
		var ret = {};

		switch(action.who){
			case 'time':
				switch(action.what){
					case 'nextEvents':
						ret.events = this.TIMER.nextEvents();
						break;
					case 'progressTime':
						ret.events = this.TIMER.progressTime();
						break;
				}
				ret.time = this.TIMER.getTime();
				ret.debug = this.TIMER.eventsTimes;
				break;
			default:
				break;
		}
		self.postMessage(ret);
	},

	init: function(){
		this.RAND.setSeed(Date.now());

		for (var i = 0; i < 7; i++) {
			this.TIMER.putEvent(i, this.RAND.getUniformInt(1, 48));
		};

		self.addEventListener('message', this.process.bind(this), false);
	},
}

ENGINE.init();