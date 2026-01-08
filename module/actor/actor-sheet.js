/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheet}
 */
 
import { LegadoRPGActor } from "../actor/actor.js";

export class LegadoRPGActorSheet extends ActorSheet {

  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["legadorpg", "sheet", "actor"],
      template: "systems/legadorpg/templates/actor/actor-sheet.html",
      width: 600,
      height: 600,
      tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "description" }]
    });
  }
  
  /** @override */   
  async getData(options) {
    const data = await super.getData(options);
    data.bio = await TextEditor.enrichHTML(this.object.system.bio, {async: true});
    return data;
  }

  /* -------------------------------------------- */

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    // Everything below here is only needed if the sheet is editable
    if (!this.options.editable) return;
	
    // Create Skill.
    html.find('.create-skill').click(this._onCreateSkill.bind(this));

    // Rollable abilities.
    html.find('.roll-attr').click(this._onRollAttr.bind(this));
	
    // Roll pericia.
    html.find('.roll-pericia').click(this._onRollPericia.bind(this));

    // Roll ataque.
    html.find('.roll-attack').click(this._onRollAtaque.bind(this));

    // Roll defesa.
    html.find('.roll-def').click(this._onRollDef.bind(this));

    // Roll cast.
    html.find('.roll-cast').click(this._onRollCast.bind(this));
	
    // Roll item.
    html.find('.item-rollable').click(this._onRollItem.bind(this));
	
	// Items
	html.find('.item-create').click(this._onItemCreate.bind(this));
	html.find('.item-edit').click(this._onItemEdit.bind(this));
	html.find('.item-delete').click(this._onItemDelete.bind(this));
	
	//html.find('.create-poder').click(this._onCreatePoder.bind(this));
	

    // Drag events for macros.
    if (this.actor.owner) {
      let handler = ev => this._onDragItemStart(ev);
      html.find('li.item').each((i, li) => {
        if (li.classList.contains("inventory-header")) return;
        li.setAttribute("draggable", true);
        li.addEventListener("dragstart", handler, false);
      });
    }
  }
  
	async standardRoll(){
		let roll = new Roll("1d100");
		await roll.roll({"async": false});
		
		return roll;
	}
	
	async customRoll(rollString){
		let roll = new Roll(rollString);
		await roll.roll({"async": false});
		
		return roll;
	}
	
	displayRoll(roll, label, fate, targets, messages){
		let r = roll.dice[0].total;

		if(fate){
			if(r > 94){
				label = label + "<div>Mermão, deu ruim</div>";
			}
		}
		
		if(r < targets[0]){
			label = label + messages[0];
		} else if (r < targets[1]) {
			label = label + messages[1];
		} else if (r < targets[2]) {
			label = label + messages[2];
		} else if (r < targets[3]) {
			label = label + messages[3];
		} else {
			label = label + messages[4];
		}
		
		roll.toMessage({
			speaker: ChatMessage.getSpeaker({ actor: this.actor }),
			flavor: label
		});
	}
   
   /**
	* Handle clickable rolls.
	* @param {Event} event   The originating click event
	* @private
	*/
	async _onRollAttr(event) {
		event.preventDefault();
		const element = event.currentTarget;
		const dataset = element.dataset;
		let attr = element.getAttribute("attr");
	  
		let confirmed = false;
		let roll = await this.standardRoll();

		new Dialog({
			title: "Rolagem de Atributo",
			content: `
			 <form>
			  <div>
			   <div style="padding-bottom: 20px">
			    <label>Junta Outro Atributo:</label>
			    <select id="sec" name="sec">
					<option value="fisicos.forca">Força</option>
					<option value="fisicos.destreza">Destreza</option>
					<option value="fisicos.agilidade">Agilidade</option>
					<option value="fisicos.constituicao">Constituição</option>
					<option value="mentais.inteligencia">Inteligência</option>
					<option value="mentais.astucia">Astúcia</option>
					<option value="mentais.vontade">Vontade</option>
					<option value="mentais.carisma">Carisma</option>
			    </select>
			   </div>
			  </div>
			 </form>
			 `,
			buttons: {
				one: {
					icon: '<i class="fas fa-check"></i>',
					label: "Vai!",
					callback: () => confirmed = true
				},
				two: {
					icon: '<i class="fas fa-times"></i>',
					label: "Não vai",
					callback: () => confirmed = false
				}
			},
			default: "Cancel",
			close: html => {
				if (confirmed) {
					let sec = html.find('[name=sec]')[0].value;
					let attr1 = this.attrToActorAttr(attr, this.actor.system);
					let attr2 = this.attrToActorAttr(sec, this.actor.system);
					
					let label = "Rolando " + this.attrToShort(attr) + "+" + this.attrToShort(sec);
					
					let facil = attr1.facil + attr2.facil;
					let normal = attr1.normal + attr2.normal;
					let dificil = attr1.dificil + attr2.dificil;
					let extremo = attr1.extremo + attr2.extremo;
					
					this.displayRoll(roll, label, true, [extremo, dificil, normal, facil], [
							"<div>Passou Extremo</div>",
							"<div>Passou Difícil</div>",
							"<div>Passou Normal</div>",
							"<div>Passou Fácil</div>",
							"<div>Não Passou</div>"
						]
					);
				}
			}
		}).render(true);	  
		  
	}
	
	async _onRollPericia(event) {
		event.preventDefault();
		const element = event.currentTarget;
		const dataset = element.dataset;
		let pid = element.getAttribute("attr");
		let pname = element.innerHTML;

		let p = this.actor.system.pericias[pid];
		
		let roll = await this.standardRoll();
		let label = "<div>Rolando " + pname + "</div>";
						
		this.displayRoll(roll,label, true, [p.extremo, p.dificil, p.normal, p.facil], [
				"<div>Passou Extremo</div>",
				"<div>Passou Difícil</div>",
				"<div>Passou Normal</div>",
				"<div>Passou Fácil</div>",
				"<div>Não Passou</div>"
			]
		);
	}
  
	async _onRollAtaque(event) {
		event.preventDefault();

		let roll = await this.standardRoll();

		let label = "<div>Atacando!</div>";
		
		let value = this.actor.system.secundarios.ataque.total;

		let extremo = value / 5;
		let dificil = value / 2;
		let normal = value;
		let facil = value * 2;
						
		this.displayRoll(roll,label, true, [extremo, dificil, normal, facil], [
				"<div>QUE GOLPE LINDO!</div><div>Explosão do Extremo!!</div>",
				"<div>Em Cheio!</div><div>Sucesso Difícil!</div>",
				"<div>Pegou!</div><div>Sucesso Normal</div>",
				"<div>NO VÁCUO!</div>",
				"<div>NO VÁCUO!</div>"
			]
		);
	}
  
	async _onRollDef(event) {
		event.preventDefault();
		
		let roll = await this.standardRoll();
		
		let label = "<div>Defendendo!</div>";
		
		let value = this.actor.system.secundarios.defesa.total;

		let extremo = value / 5;
		let dificil = value / 2;
		let normal = value;
		let facil = value * 2;
						
		this.displayRoll(roll,label, true, [extremo, dificil, normal, facil], [
				"<div>DEFESA ÉÉÉÉÉÉÉPICAAAA! (def /5)</div><div>Sucesso Extremo!!</div>",
				"<div>BLOQUEIO PERFEITO! (def/2)</div><div>Sucesso Difícil!</div>",
				"<div>Boa Guarda! (def)</div><div>Sucesso Normal</div>",
				"<div>Tem falha nessa postura</div>",
				"<div>Tem falha nessa postura</div>"
			]
		);
	}
  
	async _onRollCast(event) {
		event.preventDefault();
		
		let roll = await this.standardRoll();
		
		let label = "<div>Conjurando!</div>";
		
		let value = this.actor.system.secundarios.conjuracao.total;

		let extremo = value / 5;
		let dificil = value / 2;
		let normal = value;
		let facil = value * 2;
						
		this.displayRoll(roll, label, true, [extremo, dificil, normal, facil], [
				"<div>QUE MAGIA LINDA!</div><div>Sucesso Extremo!!</div>",
				"<div>Em Cheio!</div><div>Sucesso Difícil!</div>",
				"<div>Pegou!</div><div>Sucesso Normal</div>",
				"<div>NO VÁCUO!</div>",
				"<div>NO VÁCUO!</div>"
			]
		);
	}
  
	async _onRollItem(event) {
		event.preventDefault();
		const element = event.currentTarget;
		const dataset = element.dataset;
		let damage = element.getAttribute("damage");
		let source = element.innerHTML;
		
		if(damage != null){
			if(damage != ""){
				//let roll = new Roll(damage);
				//roll.roll({"async": false});
				let roll = await this.customRoll(damage);
				let label = "<div>Dano de " + source + "</div>";
				
				roll.toMessage({
					speaker: ChatMessage.getSpeaker(this.actor),
					flavor: label
				});
			}
		}
	}
  
	/**
	* Handle creating a new Owned Item for the actor using initial data defined in the HTML dataset
	* @param {Event} event   The originating click event
	* @private
	*/
	_onItemCreate(event) {
		//event.preventDefault();
		const element = event.currentTarget;
		const dataset = element.dataset;
		let type = element.getAttribute("type");
		
		const itemData = {
			"name": type,
			"type": type
		};
		return Item.create(itemData, {parent: this.actor});
	}
	
	_onItemEdit(event) {
		//event.preventDefault();
		const item_id = event.currentTarget.getAttribute("data-item-id");
		const item = this.actor.items.get(item_id);
		item.sheet.render(true);
	}	
	
	_onItemDelete(event) {
		//event.preventDefault();
		const item_id = event.currentTarget.getAttribute("data-item-id");
		const item = this.actor.items.get(item_id);
		item.delete();
	}
	
	
	/** @override */
	async _onDropItemCreate(itemData) {
		let aItens = this.actor.items.entries();
		//Characters can have only a single of these
		if(itemData.type == "ancestralidade"){
			//Make sure only the last one added remains
			if(aItens != null){
				for (let e of aItens){
					let item = e[1];
					let itemData = item.system;
					
					if(item.type == "ancestralidade"){
						item.delete()
					}
				}
			}
		}
		
		if(itemData.type == "casta"){
			//Make sure only the last one added remains
			if(aItens != null){
				for (let e of aItens){
					let item = e[1];
					let itemData = item.system;
					
					if(item.type == "casta"){
						item.delete()
					}
				}
			}
		}

		// Create the owned item as normal
		return super._onDropItemCreate(itemData);
	}
	
	
	async _onCreatePoder(event) {
		//event.preventDefault();
		const element = event.currentTarget;
		const dataset = element.dataset;
		let type = element.getAttribute("type");
		let heritage = element.getAttribute("heritage");
		
		const itemData = {
			"name": type,
			"type": type
		};
		
		let item = await Item.create(itemData, {parent: this.actor});
		console.log(item)
		item.system.heranca = heritage;
		return item;
	}
	
	async _onCreateSkill(event) {
		//event.preventDefault();
		let confirmed = false;
		
		new Dialog({
			title: "Criando Pericia",
			content: `
			 <form>
			  <div>
			   <div style="padding-bottom: 20px">
			    <label>Nome:</label>
				<input type="text" name="attrName" id="attrName">
			   </div>
			   <div style="padding-bottom: 20px">
			    <label>Atributo:</label>
			    <select id="attr" name="attr">
					<option value="FOR">FOR</option>
					<option value="DES">DES</option>
					<option value="AGI">AGI</option>
					<option value="CON">CON</option>
					<option value="INT">INT</option>
					<option value="AST">AST</option>
					<option value="VON">VON</option>
					<option value="CAR">CAR</option>
			    </select>
			   </div>
			  </div>
			 </form>
			 `,
			buttons: {
				one: {
					icon: '<i class="fas fa-check"></i>',
					label: "Vai!",
					callback: () => confirmed = true
				},
				two: {
					icon: '<i class="fas fa-times"></i>',
					label: "Não vai",
					callback: () => confirmed = false
				}
			},
			default: "Cancel",
			close: html => {
				if (confirmed) {
					let attrName = html.find('[name=attrName]')[0].value;
					let attr = html.find('[name=attr]')[0].value;
					let actorData = this.actor.system;
					let fullAttrName = "system.pericias." + attrName;
					actorData.pericias[attrName] = {
						"valor": 0,
						"bonus": 0,
						"attr": attr
					};
					
					this.actor.update(
						{
							 "system.pericias": actorData.pericias
						}
					)
				}
			}
		}).render(true);	  
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

	attrToActorAttr(attr, actorData){
		let toValue = {
			"fisicos.forca": actorData.primarios.fisicos.forca,
			"fisicos.destreza": actorData.primarios.fisicos.destreza,
			"fisicos.agilidade": actorData.primarios.fisicos.agilidade,
			"fisicos.constituicao": actorData.primarios.fisicos.constituicao,
			"mentais.inteligencia": actorData.primarios.mentais.inteligencia,
			"mentais.astucia": actorData.primarios.mentais.astucia,
			"mentais.vontade": actorData.primarios.mentais.vontade,
			"mentais.carisma": actorData.primarios.mentais.carisma
		};
		
		return toValue[attr];
	}
}
