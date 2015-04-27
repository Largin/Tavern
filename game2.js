Array.prototype.randomElement = function() {
	return this[Math.floor(Math.random()*this.length)];
};


GAME = {};

GAME.ENGINE = {};

GAME.ENGINE.RAND = (function(){
	var _s0 = 0, _s1 = 0, _s2 = 0, _c = 0, _frac = 2.3283064365386963e-10;
	var _seed;

	var getSeed = function() {
		return _seed;
	};

	var setSeed = function(seed) {
		seed = (seed < 1 ? 1 / seed : seed);
		_seed = seed;
		_s0 = (seed >>> 0) * _frac;
		seed = (seed * 69069 + 1) >>> 0;
		_s1 = seed * _frac;
		seed = (seed * 69069 + 1) >>> 0;
		_s2 = seed * _frac;
		_c = 1;
	};

	var getState = function() {
		return [_s0, _s1, _s2, _c];
	};

	var setState = function(state) {
			_s0 = state[0];
			_s1 = state[1];
			_s2 = state[2];
			_c = state[3];
	};

	var getUniform = function() {
		var t = 2091639 * _s0 + _c * _frac;
		_s0 = _s1;
		_s1 = _s2;
		_c = t | 0;
		_s2 = t - _c;
		return _s2;
	};

	var getUniformInt = function(lowerBound, upperBound) {
		var max = Math.max(lowerBound, upperBound);
		var min = Math.min(lowerBound, upperBound);
		return Math.floor(getUniform() * (max - min + 1)) + min;
	};

	var getPercentage = function() {
		return 1 + Math.floor(getUniform() * 100);
	};

	var getNormal = function(mean, stddev) {
		do {
			var u = 2 * getUniform() - 1;
			var v = 2 * getUniform() - 1;
			var r = u * u + v * v;
		} while (r > 1 || r == 0);

		var gauss = u * Math.sqrt(-2 * Math.log(r) / r);
		return (mean || 0) + gauss * (stddev || 1);
	};

	var getComplex = function(params) {
		var ret = 0;
		if(params.Mean && params.Dev) {
			ret = getNormal(params.Mean, params.Dev);
			if(params.Min) ret = Math.max(ret, params.Min);
			if(params.Max) ret = Math.min(ret, params.Max);
		} else if(params.Min && params.Max) {
			ret = getUniformInt(params.Min, params.Max);
		}
		if(params.add) {
			ret + params.add;
		}
		return ret;
	};

	setSeed(Date.now());

	return {
		getSeed: getSeed,
		setSeed: setSeed,
		getState: getState,
		setState: setState,
		getUniform: getUniform,
		getUniformInt: getUniformInt,
		getPercentage: getPercentage,
		getNormal: getNormal,
		getComplex: getComplex
	};
})();

GAME.ENGINE.HEROS = (function(){
	var Types = {
		Adventurer: {
			Name: 'Adventurer',
		},
		Mage: {
			Name: 'Mage',
		},
		Rouge: {
			Name: 'Rouge',
		},
		Warrior: {
			Name: 'Warrior',
		}
	};
	var TypesNames = Object.keys(Types);

	var Proto = {
		levelUp: function(){console.log('ding!')},
	};

	var createRandom = function(options)	{
		var type = TypesNames.randomElement();
		return this.create(type, options);
	};
	var create = function(type, options){
		var hero = Object.create(Proto);

		hero.Kind = Types[type].Name;
		return hero;
	};

	return {
		createRandom: createRandom,
		create: create
	};
})();

GAME.ENGINE.LAIRS = (function(){
	var Types = {
		Village: {
			what: 'that',
		},
	};
	var TypesNames = Object.keys(Types);

	var Proto = {
		lol:'lol'
	};

	var createRandom = function(options)	{
		var type = TypesNames.randomElement();
		return this.create(type, options);
	};
	var create = function(type, options){
		options = options || {a: 'ala'};
		var lair = Object.create(Proto);

		lair.a = options.a;
		lair.what = Types[type].what;
		return lair;
	};

	return {
		createRandom: createRandom,
		create: create
	};

})();



console.log(GAME);
console.log([GAME.ENGINE.LAIRS.createRandom()]);
console.log([GAME.ENGINE.HEROS.createRandom()]);