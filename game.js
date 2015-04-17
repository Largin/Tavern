'use strict';

var GAMEE = {};

GAMEE.ENGINE = {};
GAMEE.ENGINE.UTIL = {
	RandomArray: function(arr){
		if (!arr.length) { return null; }
		return arr[Math.floor(GAME.RAND.getUniform() * arr.length)];
	},
};
GAMEE.ENGINE.RAND = {
	_s0: 0,
	_s1: 0,
	_s2: 0,
	_c: 0,
	_frac: 2.3283064365386963e-10,
	/* 2^-32 */
	getSeed: function() {return this._seed;},
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
		let t = 2091639 * this._s0 + this._c * this._frac;
		this._s0 = this._s1;
		this._s1 = this._s2;
		this._c = t | 0;
		this._s2 = t - this._c;
		return this._s2;
	},
	getUniformInt: function(lowerBound, upperBound) {
		let max = Math.max(lowerBound, upperBound);
		let min = Math.min(lowerBound, upperBound);
		return Math.floor(this.getUniform() * (max - min + 1)) + min;
	},
	getNormal: function(mean, stddev) {
		do {
			var u = 2 * this.getUniform() - 1;
			var v = 2 * this.getUniform() - 1;
			var r = u * u + v * v;
		} while (r > 1 || r == 0);

		let gauss = u * Math.sqrt(-2 * Math.log(r) / r);
		return (mean || 0) + gauss * (stddev || 1);
	},
	getComplex: function(params) {
		let ret = 0;
		if(params.Mean && params.Dev) {
			ret = this.getNormal(params.Mean, params.Dev);
			if(params.Min) ret = Math.max(ret, params.Min);
			if(params.Max) ret = Math.min(ret, params.Max);
		} else if(params.Min && params.Max) {
			ret = this.getUniformInt(params.Min, params.Max);
		}
		if(params.add) {
			ret + params.add;
		}
		return ret;
	},
	getPercentage: function() {return 1 + Math.floor(this.getUniform() * 100);},
	getWeightedValue: function(data) {
		let avail = [];
		let total = 0;

		for (let id in data) {
			total += data[id];
		}
		let random = Math.floor(this.getUniform() * total);

		let part = 0;
		for (let id in data) {
			part += data[id];
			if (random < part) {
				return id;
			}
		}

		return null;
	},
	getState: function() {return [this._s0, this._s1, this._s2, this._c];},
	setState: function(state) {
		this._s0 = state[0];
		this._s1 = state[1];
		this._s2 = state[2];
		this._c = state[3];
		return this;
	},
};
GAMEE.ENGINE.LAIR = {
	create: function(){
		let newLair = Object.create(this.Proto);
		let x;
		console.log([newLair, this.Types, new Array(this.Types.entries())]);
		return newLair;
	},
	Types: new Set([1,2,3,4]),
	Proto: {
	},
};



var GAME = {
	Lairs: new Set(),
	Parties: new Set(),
};
GAME.Tavern = {
	Adventurers: new Set(),
	Party: null,

	RedrawTable: function(){
		$('#TavernAdventurersCount').text(this.Adventurers.length);
		let TA = $('#TavernAdventurers').empty();
		for(let hero of this.Adventurers){
			let tr = $(document.createElement('tr'));
			tr.attr('draggable', true);
			let td = $(document.createElement('td')).append($('#icon-ace').clone().removeAttr('id')).appendTo(tr);
			td = $(document.createElement('td')).text(hero.Name).appendTo(tr);
			td = $(document.createElement('td')).text(Math.round(hero.Skill)).appendTo(tr);
			TA.append(tr);
			tr[0].Hero = hero;
		};

		$('#TavernAdventurers>tr').on('dragstart', 	function(ev) {
			let dragIcon = $('td>div>svg', $(ev.originalEvent.target))[0];
			ev.originalEvent.dataTransfer.setDragImage(dragIcon, -10, -10);
		});
	},
};
GAME.UTIL = {
	RandomArray: function(arr){
		if (!arr.length) { return null; }
		return arr[Math.floor(GAME.RAND.getUniform() * arr.length)];
	},
	ObjectClone: function(obj){
		let copy;

		if (null == obj || "object" != typeof obj) return obj;

		if (obj instanceof Date) {
			copy = new Date();
			copy.setTime(obj.getTime());
			return copy;
		}

		if (obj instanceof Array) {
			copy = [];
			for (let i = 0, len = obj.length; i < len; i++) {
				copy[i] = this.ObjectClone(obj[i]);
			}
			return copy;
		}

		if (obj instanceof Object) {
			copy = {};
			for (let attr in obj) {
				if (obj.hasOwnProperty(attr)) copy[attr] = this.ObjectClone(obj[attr]);
			}
			return copy;
		}

		throw new Error("Unable to copy obj! Its type isn't supported.");
	}
}
GAME.RAND = {
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
		let t = 2091639 * this._s0 + this._c * this._frac;
		this._s0 = this._s1;
		this._s1 = this._s2;
		this._c = t | 0;
		this._s2 = t - this._c;
		return this._s2;
	},
	getUniformInt: function(lowerBound, upperBound) {
		let max = Math.max(lowerBound, upperBound);
		let min = Math.min(lowerBound, upperBound);
		return Math.floor(this.getUniform() * (max - min + 1)) + min;
	},
	getNormal: function(mean, stddev) {
		do {
			var u = 2 * this.getUniform() - 1;
			var v = 2 * this.getUniform() - 1;
			var r = u * u + v * v;
		} while (r > 1 || r == 0);

		let gauss = u * Math.sqrt(-2 * Math.log(r) / r);
		return (mean || 0) + gauss * (stddev || 1);
	},
	getComplex: function(params) {
		let ret = 0;
		if(params.Mean && params.Dev) {
			ret = this.getNormal(params.Mean, params.Dev);
			if(params.Min) ret = Math.max(ret, params.Min);
			if(params.Max) ret = Math.min(ret, params.Max);
		} else if(params.Min && params.Max) {
			ret = this.getUniformInt(params.Min, params.Max);
		}
		return ret;
	},
	getPercentage: function() {
		return 1 + Math.floor(this.getUniform() * 100);
	},
	getWeightedValue: function(data) {
		let avail = [];
		let total = 0;

		for (let id in data) {
			total += data[id];
		}
		let random = Math.floor(this.getUniform() * total);

		let part = 0;
		for (let id in data) {
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
GAME.ADVENTURERS = {
	Types: [
		{
			Name: 'Adventurer',
			_skill: {Min: 1, Max: 7, Mean: 2.5, Dev: 2},
			_fame: {Min:1, Max: 12, Mean:1, Dev: 4},
			_gold: {Min:2, Mean: 10, Dev: 5}
		},
	],
	Proto: {
		init: function(){
			this.Fame = GAME.RAND.getComplex(this._fame);
			this.Skill = GAME.RAND.getComplex(this._skill) + this.Fame;
			this.Gold = GAME.RAND.getComplex(this._gold) * this.Fame;
		}
	},
	getRandomType: function(){
		let newHeroP = GAME.UTIL.ObjectClone(GAME.UTIL.RandomArray(this.Types));
		newHeroP.__proto__ = this.Proto;
		let newHero = {};
		newHero.__proto__ = newHeroP;
		return newHero;
	},
	getType: function(name){
		let ret;
		for (let i = 0; i < this.Types.length; i++) {
			if(this.Types[i].Name == name){
				ret = GAME.UTIL.ObjectClone(this.Types[i]);
				ret.__proto__ = this.Proto;
				break;
			}
		};
		if(!ret) return null;
		let obj = {};
		obj.__proto__ = ret;
		return obj;
	},
	create: function(){
		let hero = this.getRandomType();
		hero.init();
		GAME.Tavern.Adventurers.add(hero);
		GAME.Tavern.RedrawTable();
	}
};
GAME.PARTY = {
	Party: {
		Heros: [],
		Loot: 0,
	},
	Proto: {
		get Skill(){
			let skill = 0;
			for (let i = 0; i < this.Heros.length; i++) {
				skill += this.Heros[i].Skill;
			};
			return skill;
		},
		Return: function(success){
			let loot = this.Loot / this.Heros.length;
			for (let i = 0; i < this.Heros.length; i++) {
				this.Heros[i].Gold += loot;
				this.Heros[i].Fame += loot/100;
				this.Heros[i].Fame += success;
				GAME.Tavern.Adventurers.add(this.Heros[i]);
			};
		}
	}
};
GAME.MONSTERS = {
	Types: [
		{
			Name: 'Bandits',
			_count: {Mean: 4.5, Dev: 1.5},
			_danger: {Min: 0.7, Mean: 2.5, Dev: 2},
			_gold: {Min: 5, Mean: 15, Dev: 5},
			_treasure: 0.3,
		},
		{
			Name: 'Goblins',
			_count: {Mean: 12, Dev: 4},
			_danger: {Min: 0.1, Mean: 1, Dev: 1},
			_gold: {Min: 0, Mean: 2, Dev: 1},
			_treasure: 2.2,
		},
		{
			Name: 'Orcs',
			_count: {Mean: 4, Dev: 2},
			_danger: {Min: 1.5, Mean: 3.5, Dev: 2},
			_gold: {Min: 2, Mean: 6, Dev: 2},
			_treasure: 1.8,
		},
	],
	Proto: {
		init: function(size){
			let count = Math.round(size * GAME.RAND.getComplex(this._count));
			for (let i = 0; i < count; i++) {
				this.addIndividual();
			};
			this.Count = this.Individuals.length;
			this.Treasure = this.Gold * this._treasure;
		},
		addIndividual: function(){
			let ind = {};
			ind.Danger = GAME.RAND.getComplex(this._danger);
			ind.Gold = GAME.RAND.getComplex(this._gold) * ind.Danger;
			this.Individuals.push(ind);
		},
		get Danger(){
			let danger = 0;
			for (let i = 0; i < this.Individuals.length; i++) {
				danger += this.Individuals[i].Danger;
			};
			return danger;
		},
		get Gold(){
			let gold = 0;
			for (let i = 0; i < this.Individuals.length; i++) {
				gold += this.Individuals[i].Gold;
			};
			return gold;
		},
	},
	getType: function(name){
		let ret;
		for (let i = 0; i < this.Types.length; i++) {
			if(this.Types[i].Name == name){
				ret = GAME.UTIL.ObjectClone(this.Types[i]);
				ret.__proto__ = this.Proto;
				break;
			}
		};
		if(!ret) return null;
		let obj = {
			Individuals: [],
		};
		obj.__proto__ = ret;
		return obj;
	},
};
GAME.LAIRS = {
	Types: [
		{
			Name: 'Village',
			_size: {Min: 1, Max: 3, Mean: 1.5, Dev: 1},
			_monsters: [
				{Chance: 3, Types: {Goblins: 2}},
				{Chance: 1, Types: {Orcs: 1}},
				{Chance: 2, Types: {Goblins: 1, Orcs: 0.5}}
			],
			_treasure: {mul: 1.2},
		},
		{
			Name: 'Cave',
			_size: {Min: 1, Max: 8, Mean: 2.5, Dev: 2.5},
			_monsters: [
				{Chance: 3, Types: {Goblins: 1.5}},
				{Chance: 1, Types: {Orcs: 1}},
				{Chance: 2, Types: {Goblins: 1, Orcs: 0.5}}
			],
			_treasure: {mul: 1.8},
		},
		{
			Name: 'Hideout',
			_size: {Min: 1, Max: 3, Mean: 1.5, Dev: 1},
			_monsters: [
				{Chance: 1, Types: {Bandits: 1}},
			],
			_treasure: {mul: 1},
		},
	],
	Proto: {
		init: function(){
			this.Size = Math.round(GAME.RAND.getComplex(this._size));
			let monsters = [];
			for (let i = 0; i < this._monsters.length; i++) {
				for (let j = 0; j < this._monsters[i].Chance; j++) {
					monsters.push(this._monsters[i].Types);
				};
			};
			this.Type = GAME.UTIL.RandomArray(monsters);
		},
		get Danger(){
			let danger = 0;
			for (let i = 0; i < this.Monsters.length; i++) {
				if(this.Monsters[i].Danger)
					danger += this.Monsters[i].Danger;
			};
			return Math.round(danger);
		},
		get MonsterType(){
			let type = '';
			for(let mon of this.Monsters){
				type += mon.Name + ',';
			}
			return type;
		},
		get MonsterCount(){
			let count = 0;
			for(let mon of this.Monsters){
				count += mon.Count;
			}
			return count;
		},
		Conflict: function(){
			if(this.Party === null) return;
			let pow = this.Party.Skill() / this.Danger;

			this.Party.Return(false);
			this.Party = null;

			if(pow < 1){
				this.Party.Return(false);
				this.Party = null;
			} else {
				this.Party.Return(true);
				this.Party = null;
				this.Destroyed = true;
			}
		}
	},
	create: function(newSize){
		let newLair = this.getRandomType();
		newLair.init();

		if(newSize) newLair.Size = newSize;

		let monsters = [];
		for(let key in newLair.Type){
			let monster = GAME.MONSTERS.getType(key);
			monster.init(newLair.Size * newLair.Type[key]);
			monsters.push(monster);
		}
		newLair.Monsters = monsters;

		GAME.Lairs.add(newLair);
		this.RedrawTable();
	},
	getRandomType: function(){
		let newLairP = GAME.UTIL.ObjectClone(GAME.UTIL.RandomArray(this.Types));
		newLairP.__proto__ = this.Proto;
		let newLair = {
			Party: null
		};
		newLair.__proto__ = newLairP;
		return newLair;
	},
	getType: function(name){
		let ret;
		for (let i = 0; i < this.Types.length; i++) {
			if(this.Types[i].Name == name){
				ret = GAME.UTIL.ObjectClone(this.Types[i]);
				ret.__proto__ = this.Proto;
				break;
			}
		};
		if(!ret) return null;
		let obj = {
			Party: null
		};
		obj.__proto__ = ret;
		return obj;
	},
	RedrawTable: function(){
		let LA = $('#Lairs').empty();
		for (let lair of GAME.Lairs) {
			let tr = $(document.createElement('tr'));
			let td = $(document.createElement('td')).text(lair.MonsterType).appendTo(tr);
			td = $(document.createElement('td')).text(lair.Size).appendTo(tr);
			td = $(document.createElement('td')).text(lair.MonsterCount).appendTo(tr);
			td = $(document.createElement('td')).text(lair.Danger).appendTo(tr);
			tr.appendTo(LA);
			tr[0].Lair = lair;
		};
	},
};