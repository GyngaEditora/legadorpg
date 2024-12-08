/**
 * Extend the basic Item with some very simple modifications.
 * @extends {Item}
 */
export class LegadoRPGItem extends Item {
  /**
   * Augment the basic Item data model with additional dynamic data.
   */
	prepareData() {
		super.prepareData();

		// Get the Item's data
		const itemData = this.system;
		const actorData = this.actor ? this.actor.system : {};
		const data = itemData.data;
		
		if(this.type == "pericia"){
			this.preparePericiaData(data, actorData);
		}
	}
	
	preparePericiaData(data, actorData){
		if(!(actorData === undefined)){
			this.updatePericia(actorData.system);
		}
	}
	
	async updatePericia(actorData){
		let data = this.system;
		
		let normal = await this.attrToActorNormal(data.atributo, actorData);
		data.normal = data.valor + normal;
		data.facil = data.normal * 2;
		data.dificil = data.normal / 2;
		data.extremo = data.normal / 5;
		data.shortAttr = this.attrToShort(data.atributo);
	}
	
	attrToShort(attr){
		let shorts = {
			"fisicos.forca": "FOR",
			"fisicos.destreza": "DES",
			"fisicos.agilidade": "AGI",
			"fisicos.constituicao": "CON",
			"mentais.inteligencia": "INT",
			"mentais.astucia": "AST",
			"mentais.vontade": "VON",
			"mentais.carisma": "CAR"
		}
		
		return shorts[attr];
	}
	
	async attrToActorNormal(attr, actorData){
		await actorData;
		
		let toValue = {
			"fisicos.forca": actorData.primarios.fisicos.forca.normal,
			"fisicos.destreza": actorData.primarios.fisicos.destreza.normal,
			"fisicos.agilidade": actorData.primarios.fisicos.agilidade.normal,
			"fisicos.constituicao": actorData.primarios.fisicos.constituicao.normal,
			"mentais.inteligencia": actorData.primarios.mentais.inteligencia.normal,
			"mentais.astucia": actorData.primarios.mentais.astucia.normal,
			"mentais.vontade": actorData.primarios.mentais.vontade.normal,
			"mentais.carisma": actorData.primarios.mentais.carisma.normal
		};
		
		return toValue[attr];
	}
}
