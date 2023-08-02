const ItemCatalogueService = require("../services/itemCatalogueService");
var moment = require("moment"); // require

class ItemCatalogueUtils {
  constructor() {}
  validateItemCatalogue = async (itemCatalogue, req) => {
    let isValid = true;
    let errors = [];
    if (itemCatalogue.type == null || itemCatalogue.type.length == 0) {
      isValid = false;
      errors.push("Type can not be empty.");
    }
    if (itemCatalogue.code == null || itemCatalogue.code.length == 0) {
      isValid = false;
      errors.push("Code can not be empty.");
    }
    if (
      itemCatalogue.description == null ||
      itemCatalogue.description.length == 0
    ) {
      isValid = false;
      errors.push("Description can not be empty.");
    }
    if (
      itemCatalogue.effectiveDate == null ||
      itemCatalogue.effectiveDate.length == 0
    ) {
      isValid = false;
      errors.push("Effective Date can not be empty.");
    }
    if (!moment(itemCatalogue.effectiveDate, "DD/MM/YYYY").isValid()) {
      isValid = false;
      errors.push("Invalid Effective Date");
    }
    return errors;
  };
}
module.exports = new ItemCatalogueUtils();
