/**
 * Extend the basic ItemSheet with some very simple modifications
 * @extends {ItemSheet}
 */
export class LegadoRPGItemSheet extends ItemSheet {

  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["legadorpg", "sheet", "item"],
      width: 520,
      height: 480,
      tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "description" }]
    });
  }
  
  /** @override */   
  async getData(options) {
    const data = await super.getData(options);
    data.descricao = await TextEditor.enrichHTML(this.object.system.descricao, {async: true});
    data.heranca = await TextEditor.enrichHTML(this.object.system.heranca, {async: true});
    return data;
  }

  /** @override */
  get template() {
    const path = "systems/legadorpg/templates/item";
    // Return a single sheet for all item types.
    //return `${path}/item-sheet.html`;

    // Alternatively, you could use the following return statement to do a
    // unique item sheet by type, like `weapon-sheet.html`.
    return `${path}/item-${this.item.type}-sheet.html`;
  }

  /* -------------------------------------------- */

  /* -------------------------------------------- */
}
