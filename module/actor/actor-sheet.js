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
   
   /**
	* Handle clickable rolls.
	* @param {Event} event   The originating click event
	* @private
	*/
	async _onRollAttr(event) {
		const element = event.currentTarget;
		const dataset = element.dataset;
		let attr = element.getAttribute("attr");
	  
		let confirmed = false;

		new Dialog({
			title: "1001 dados",
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
					let roll = new Roll("1d100");
					roll.roll({"async": false});
					let label = "Rolando " + this.attrToShort(attr) + "+" + this.attrToShort(sec);
					
					console.log(label);
					
					let r = roll.dice[0].total;
					
					let facil = attr1.facil + attr2.facil;
					let normal = attr1.normal + attr2.normal;
					let dificil = attr1.dificil + attr2.dificil;
					let extremo = attr1.extremo + attr2.extremo;

					if(r > 94){
						label = label + "<div>Mermão, deu ruim</div>";
					} else if(r < extremo){
						label = label + "<div>Passou Extremo</div>";
					} else if (r < dificil) {
						label = label + "<div>Passou Difícil<</div>";
					} else if (r < normal) {
						label = label + "<div>Passou Normal<</div>";
					} else if (r < facil) {
						label = label + "<div>Passou Fácil<</div>";
					} else {
						label = label + "<div>Não Passou</div>";
					}

					roll.toMessage({
						speaker: ChatMessage.getSpeaker(this.actor),
						flavor: label
					});
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

		console.log(pid);
		let p = this.attrToSkill(pid, this.actor.system);
		console.log(p);

		let formulae = "1d100";

		let roll = new Roll(formulae);
		roll.roll({"async": false});
		let label = "<div>Rolando " + pname + "</div>";

		let r = roll.dice[0].total;
		
		
		if(r > 94){
			label = label + "<div>Mermão, deu ruim</div>";
		} else if(r < p.extremo){
			label = label + "<div>Passou Extremo</div>";
		} else if (r < p.dificil) {
			label = label + "<div>Passou Difícil</div>";
		} else if (r < p.normal) {
			label = label + "<div>Passou Normal</div>";
		} else if (r < p.facil) {
			label = label + "<div>Passou Fácil</div>";
		} else {
			label = label + "<div>Não Passou</div>";
		}

		roll.toMessage({
			speaker: ChatMessage.getSpeaker(this.actor),
			flavor: label
		});
	}
  
  _onRollAtaque(event) {
    event.preventDefault();
	
	let formulae = "1d100";

	let roll = new Roll(formulae);
	roll.roll({"async": false});
	let label = "<div>Atacando!</div>";
	
	let r = roll.dice[0].total;
	
	if(r < this.actor.system.secundarios.ataque / 5){
		label = label + "<div>QUE GOLPE LINDO!</div>";
	} else if (r < this.actor.system.secundarios.ataque / 2) {
		label = label + "<div>Em Cheio!</div>";
	} else if (r < this.actor.system.secundarios.ataque) {
		label = label + "<div>Pegou!</div>";
	} else if (r < this.actor.system.secundarios.ataque * 2) {
		label = label + "<div>Tirou um fino</div>";
	} else {
		label = label + "<div>NO VÁCUO!</div>";
	}
	
	roll.toMessage({
		speaker: ChatMessage.getSpeaker(this.actor),
		flavor: label
	});
  }
  
  _onRollDef(event) {
    event.preventDefault();
	
	let formulae = "1d100";

	let roll = new Roll(formulae);
	roll.roll({"async": false});
	let label = "<div>Defendendo!</div>";
	
	let r = roll.dice[0].total;
	
	if(r < this.actor.system.secundarios.defesa / 5){
		label = label + "<div>DEFESA ÉÉÉÉÉÉÉPICAAAA!</div>";
	} else if (r < this.actor.system.secundarios.defesa / 2) {
		label = label + "<div>BLOQUEIO PERFEITO!</div>";
	} else if (r < this.actor.system.secundarios.defesa) {
		label = label + "<div>Boa Guarda!</div>";
	} else if (r < this.actor.system.secundarios.defesa * 2) {
		label = label + "<div>Por um triz</div>";
	} else {
		label = label + "<div>Essa doeu!</div>";
	}
	
	roll.toMessage({
		speaker: ChatMessage.getSpeaker(this.actor),
		flavor: label
	});
  }
  
  _onRollCast(event) {
    event.preventDefault();
	
	let formulae = "1d100";

	let roll = new Roll(formulae);
	roll.roll({"async": false});
	let label = "<div>Conjurando!</div>";
	
	let r = roll.dice[0].total;
	
	if(r < this.actor.system.secundarios.conjuracao / 5){
		label = label + "<div>QUE MAGIA LINDA!</div>";
	} else if (r < this.actor.system.secundarios.conjuracao / 2) {
		label = label + "<div>Em Cheio!</div>";
	} else if (r < this.actor.system.secundarios.conjuracao) {
		label = label + "<div>Pegou!</div>";
	} else if (r < this.actor.system.secundarios.conjuracao * 2) {
		label = label + "<div>Tirou um fino</div>";
	} else {
		label = label + "<div>NO VÁCUO!</div>";
	}
	
	roll.toMessage({
		speaker: ChatMessage.getSpeaker(this.actor),
		flavor: label
	});
  }
  
  _onRollItem(event) {
    event.preventDefault();
	const element = event.currentTarget;
	const dataset = element.dataset;
	let damage = element.getAttribute("damage");
	let source = element.innerHTML;
	
	if(damage != null){
		if(damage != ""){
			let roll = new Roll(damage);
			roll.roll({"async": false});
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

	attrToSkill(attr, actorData){
		let toValue = {
			"pericias.acrobatismo": actorData.pericias.acrobatismo,
			"pericias.artimanha": actorData.pericias.artimanha,
			"pericias.arcanismo": actorData.pericias.arcanismo,
			"pericias.atletismo": actorData.pericias.atletismo,
			"pericias.ciencias": actorData.pericias.ciencias,
			"pericias.computacao": actorData.pericias.computacao,
			"pericias.conducao": actorData.pericias.conducao,
			"pericias.cosmologia": actorData.pericias.cosmologia,
			"pericias.cultura": actorData.pericias.cultura,
			"pericias.determinacao": actorData.pericias.determinacao,
			"pericias.dissimulacao": actorData.pericias.dissimulacao,
			"pericias.engenharias": actorData.pericias.engenharias,
			"pericias.empatia": actorData.pericias.empatia,
			"pericias.furtividade": actorData.pericias.furtividade,
			"pericias.intimidacao": actorData.pericias.intimidacao,
			"pericias.investigacao": actorData.pericias.investigacao,
			"pericias.manha": actorData.pericias.manha,
			"pericias.medicina": actorData.pericias.medicina,
			"pericias.percepcao": actorData.pericias.percepcao,
			"pericias.persuasao": actorData.pericias.persuasao,
			"pericias.profissao": actorData.pericias.profissao,
			"pericias.resistencia": actorData.pericias.resistencia,
			"pericias.sobrevivencia": actorData.pericias.sobrevivencia
		};
		
		return toValue[attr];
	}
}
