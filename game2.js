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
		if(params.Dices)
			ret = rollDices(params.Dices);
		if(params.Mean && params.Dev) {
			ret = getNormal(params.Mean, params.Dev);
			if(params.Min) ret = Math.max(ret, params.Min);
			if(params.Max) ret = Math.min(ret, params.Max);
		} else if(params.Min && params.Max) {
			ret = getUniformInt(params.Min, params.Max);
		}
		if(params.Add) {
			ret += params.Add;
		}
		if(params.Round){
			ret = Math.round(ret);
		}
		return ret;
	};

	var rollDices = function(dices){
		var REx = /(\d*)?d(\d*)((?:\+|-)(?:\d*))?/gi;
		var ret = REx.exec(dices);

		if(!ret) return false;

		var rolls, sum;
		rolls = ret[1] ? parseInt(ret[1]) : 1;
		sum = ret[3] ? parseInt(ret[3]) : 0;

		for (var i = 0; i < rolls; i++) {
			sum += getUniformInt(1, ret[2]);
		};

		return sum;
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
		getComplex: getComplex,
		rollDices: rollDices
	};
})();

GAME.ENGINE.HEROS = (function(){
	var Types = {
		Adventurer: {
			Name: 'Adventurer',
			Attributes: ['Strength', 'Dexterity', 'Constitution', 'Wisdom'],
		},
		Mage: {
			Name: 'Mage',
			Attributes: ['Wisdom', 'Dexterity', 'Constitution', 'Strength'],
		},
		Rogue: {
			Name: 'Rogue',
			Attributes: ['Dexterity', 'Strength', 'Constitution', 'Wisdom'],
		},
		Warrior: {
			Name: 'Warrior',
			Attributes: ['Strength', 'Constitution', 'Dexterity', 'Wisdom'],
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
		var attributes = ['3d6', '3d6', '3d6', '3d6'];

		hero.Kind = Types[type].Name;
		for (var i = 0, l = attributes.length; i < l; i++) {
			attributes[i] = GAME.ENGINE.RAND.rollDices(attributes[i]);
		};
		attributes.sort(function(a, b){return b-a});
		for (var key of Types[type].Attributes){
			hero[key] = attributes.shift();
		}

		return hero;
	};

	return {
		createRandom: createRandom,
		create: create
	};
})();

GAME.ENGINE.MONSTERS = (function(){
	var Types = {
		Generic: {
			Name: 'Generic Monster',
			Attributes: ['Strength', 'Constitution', 'Dexterity', 'Wisdom'],
		}
	};

	var Proto = {};
	var TypesNames = Object.keys(Types);

	var createRandom = function(options)	{
		var type = TypesNames.randomElement();
		return this.create(type, options);
	};
	var create = function(type, options){
		options = options || {};
		var monster = Object.create(Proto);
		var attributes = ['3d6', '3d6', '3d6', '3d6'];

		monster.Name = Types[type].Name;
		for (var i = 0, l = attributes.length; i < l; i++) {
			attributes[i] = GAME.ENGINE.RAND.rollDices(attributes[i]);
		};
		attributes.sort(function(a, b){return b-a});
		for (var key of Types[type].Attributes){
			monster[key] = attributes.shift();
		}

		for(var key in options)
			monster[key] = options[key];

		return monster;
	};

	return {
		createRandom: createRandom,
		create: create
	};
})();

GAME.ENGINE.LAIRS = (function(){
	var Types = {
		Generic: {
			Name: 'Generic Lair',
			Size: {Min: 1, Mean: 2, Dev: 1},
			Monsters: [{Type: 'Generic', Count: {Mean: 6, Dev: 2, Add: 5, Round: true}}]
		},
	};
	var TypesNames = Object.keys(Types);

	var Proto = {
		get Count(){
			return this.Monsters.length;
		},
	};

	var createRandom = function(options)	{
		var type = TypesNames.randomElement();
		return this.create(type, options);
	};
	var create = function(type, options){
		options = options || {};
		var lair = Object.create(Proto);

		lair.Name = Types[type].Name;

		lair.Size = options.Size || GAME.ENGINE.RAND.getComplex(Types[type].Size);
		lair.Monsters = [];
		for (var monster of Types[type].Monsters){
			var count = GAME.ENGINE.RAND.getComplex(monster.Count);
			count *= lair.Size;
			for (var i = 0; i < count; i++) {
				lair.Monsters.push(GAME.ENGINE.MONSTERS.create(monster.Type));
			};
		}

		return lair;
	};

	return {
		createRandom: createRandom,
		create: create
	};
})();



console.log(GAME);
console.log(GAME.ENGINE.HEROS.createRandom());
console.log(GAME.ENGINE.LAIRS.createRandom());
console.log(GAME.ENGINE.LAIRS.createRandom({Size: 1}));
