/**
 * Extend the base Actor entity by defining a custom roll data structure which is ideal for the Simple system.
 * @extends {Actor}
 */
export class LegadoRPGActor extends Actor {

	/**
	* Augment the basic actor data with additional dynamic data.
	*/
	prepareData() {
		super.prepareData();
		
		const actorData = this.system;
				
		if(this.type == "Jogador"){
			this.prepareDataJogador(actorData);
		}
	}
	
	/*****/
	
	prepareDataJogador(data){
		console.log(data);
		let items = this.items.entries();
		let bonusA = {
			vida: 0,
			espirito: 0,
			ataque: 0,
			defesa: 0,
			conjuracao: 0
		};
		
		let bonusC = {
			vida: 0,
			espirito: 0,
			ataque: 0,
			defesa: 0,
			conjuracao: 0
		};
		
		//Verifica Ancestralidade e Casta;
		for (let i of items){
			let item = i[1];
			if(item.type == "ancestralidade"){
				bonusA = item.system.bonus;
			}
			if(item.type == "casta"){
				bonusC = this.bonusCasta(item, data.nivel);
			}
		}
		
		//calcula atributos primarios
		for (let f in data.primarios.fisicos){
			let attr = data.primarios.fisicos[f];
			attr.total = attr.valor + attr.bonus + bonusA[f];
			attr.facil = attr.total * 10;
			attr.normal = attr.total * 5;
			attr.dificil = attr.normal / 2;
			attr.extremo = attr.total;
		}
		for (let m in data.primarios.mentais){
			let attr = data.primarios.mentais[m];
			attr.total = attr.valor + attr.bonus + bonusA[m];
			attr.facil = attr.total * 10;
			attr.normal = attr.total * 5;
			attr.dificil = attr.normal / 2;
			attr.extremo = attr.total;
		}
		
		data.secundarios.vida = data.primarios.fisicos.constituicao.total + bonusA.vida + bonusC.vida;
		data.secundarios.espirito_total = data.primarios.mentais.vontade.total + bonusA.espirito + bonusC.espirito;
		data.secundarios.ataque.base = data.primarios.fisicos.destreza.normal + bonusC.ataque;
		data.secundarios.ataque.total = data.secundarios.ataque.base + data.secundarios.ataque.mod;
		data.secundarios.defesa.base = data.primarios.fisicos.agilidade.normal + bonusC.defesa;
		data.secundarios.defesa.total = data.secundarios.defesa.base + data.secundarios.defesa.mod;
		data.secundarios.conjuracao.base = data.primarios.mentais.astucia.normal + bonusC.conjuracao;
		data.secundarios.conjuracao.total = data.secundarios.conjuracao.base + data.secundarios.conjuracao.mod;
		
		//calcula pericias
		for (let m in data.pericias){
			let attr = data.pericias[m];
			attr.total = attr.valor + attr.bonus + this.shortToAttr(attr.attr).normal;
			attr.facil = attr.total * 2;
			attr.normal = attr.total;
			attr.dificil = attr.normal / 2;
			attr.extremo = attr.total / 5;
		}
	}

	bonusCasta(casta, nivel){
		let bonus = casta.system.bonus;
		
		bonus.vida = bonus.vida + casta.system.nivel.vida*(nivel - 1);
		bonus.espirito = bonus.espirito + casta.system.nivel.espirito*(nivel - 1);
		
		return bonus;
	}
	
	shortToAttr(attr){
		const actorData = this.system;
		
		let shorts = {
			"FOR": actorData.primarios.fisicos.forca,
			"DES": actorData.primarios.fisicos.destreza,
			"AGI": actorData.primarios.fisicos.agilidade,
			"CON": actorData.primarios.fisicos.constituicao,
			"INT": actorData.primarios.mentais.inteligencia,
			"AST": actorData.primarios.mentais.astucia,
			"VON": actorData.primarios.mentais.vontade,
			"CAR": actorData.primarios.mentais.carisma
		}
		
		return shorts[attr];
	}
}