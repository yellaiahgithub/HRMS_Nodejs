const {
  switchDB,
  getDBModel,
  itemCatalogueSchema,
  uploadResultsSchema,
} = require("../middlewares/switchDB");
var moment = require("moment");

const ItemCatalogueUtils = require("../utils/itemCatalogueUtils");
class ItemCatalogueService {
  constructor() {}

  createItemCatalogue = async (data, req, res) => {
    try {
      console.log("Data for itemCatalogue create", data);
      const DB = await switchDB(req.subdomain, itemCatalogueSchema);
      const itemCatalogueModel = await getDBModel(DB, "itemCatalogue");
      const savedItemCatalogue = await itemCatalogueModel.insertMany([data], {
        runValidators: true,
      });
      return savedItemCatalogue;
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  };

  createAllItemCatalogues = async (data, req, res) => {
    try {
      let errorList = [];
      let errorCount = 0;
      let sucessList = [];
      let sucessfullyAddedCount = 0;
      const ItemCatalogueDB = await switchDB(
        req.subdomain,
        itemCatalogueSchema
      );
      const uploadResultsDB = await switchDB(
        req.subdomain,
        uploadResultsSchema
      );
      const itemCatalogueModel = await getDBModel(
        ItemCatalogueDB,
        "itemCatalogue"
      );
      const uploadResultsModel = await getDBModel(
        uploadResultsDB,
        "uploadResults"
      );
      let uploadingData = {
        type: "Item Catalogue",
        uploadedBy: "namya",
        fileName: data.fileName,
        errorFileName: data.fileName,
        status: "InProgress",
        uploadedData: data.data,
        createdAt: new Date(),
        csvHeader: [
          { label: "Item_Type", key: "type" },
          { label: "Item_Code", key: "code" },
          { label: "Description", key: "description" },
          { label: "Effective_Date(DD/MM/YYYY)", key: "effectiveDate" },
        ],
      };
      const createUploadResult = await uploadResultsModel.insertMany(
        [uploadingData],
        {
          runValidators: true,
        }
      );
      for (let i = 0; i < data.data?.length > 0; i++) {
        const itemCatalogue = data.data[i];
        console.log("processing the record: ", i + 1);
        const errors = await ItemCatalogueUtils.validateItemCatalogue(
          itemCatalogue,
          req
        );
        if (errors.length > 0) {
          const errorData = { ...itemCatalogue };
          errorData.errors = errors;
          errorList.push(errorData);
          errorCount++;
        } else {
          try {
            const itemCatalogueData = { ...itemCatalogue, status: true };
            itemCatalogueData["effectiveDate"] = new Date(
              moment(itemCatalogue.effectiveDate, "DD/MM/YYYY")
            );
            const savedItemCatalogue = await itemCatalogueModel.insertMany(
              [itemCatalogueData],
              { runValidators: true }
            );
            if (savedItemCatalogue.length > 0) {
              sucessList.push(itemCatalogueData);
              sucessfullyAddedCount++;
            }
          } catch (error) {
            const errorData = { ...itemCatalogue };
            errorData.errors = error.errors?.code?.properties?.message;
            errorList.push(errorData);
            errorCount++;
            console.log("error occured while saving record", i + 1);
          }
        }
        console.log("processed record", i + 1);
      }
      const updateUploadResult = await uploadResultsModel.updateOne(
        { _id: createUploadResult[0]._id },
        {
          $set: {
            status:
              sucessfullyAddedCount == data.data.length ? "Sucess" : "Rejected",
            errorData: errorList,
            updatedAt: new Date(),
          },
        },
        { upsert: false, runValidators: true }
      );
      console.log();
      return {
        totalRecords: data.data.length,
        sucessfullyAdded: sucessfullyAddedCount,
        errorCount: errorCount,
        errorData: errorList,
        sucessData: sucessList,
        data: data.data,
      };
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  };

  updateItemCatalogue = async (data, req, res) => {
    try {
      console.log("Data for itemCatalogue update", data);
      const DB = await switchDB(req.subdomain, itemCatalogueSchema);
      const itemCatalogueModel = await getDBModel(DB, "itemCatalogue");
      const opts = { upsert: false, runValidators: true };
      const updatedData = {
        type: data.type,
        code: data.code,
        description: data.description,
        status: data.status,
        effectiveDate: data.effectiveDate,
        createdAt: data.createdAt,
        updatedAt: new Date(),
      };
      return await itemCatalogueModel.updateOne(
        { _id: data._id },
        updatedData,
        opts
      );
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  };

  findAll = async (req, res) => {
    try {
      const DB = await switchDB(req.subdomain, itemCatalogueSchema);
      const itemCatalogueModel = await getDBModel(DB, "itemCatalogue");
      return await itemCatalogueModel.find({}).lean();
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  };

  findItemCatalogue = async (query, req) => {
    try {
      const DB = await switchDB(req.subdomain, itemCatalogueSchema);
      const itemCatalogueModel = await getDBModel(DB, "itemCatalogue");
      return await itemCatalogueModel.find(query).lean();
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  };
  searchItemCatalogue = async (data, req) => {
    try {
      const DB = await switchDB(req.subdomain, itemCatalogueSchema);
      const itemCatalogueModel = await getDBModel(DB, "itemCatalogue");
      const searchresults = [];
      const typeQuery = { type: new RegExp(data, "i") };
      const typeSearch = await itemCatalogueModel.find(typeQuery).lean();
      if (typeSearch && typeSearch.length > 0) {
        typeSearch.forEach((result) => {
          searchresults.push(result);
        });
      }
      const codeQuery = { code: new RegExp(data, "i") };
      const codeSearch = await itemCatalogueModel.find(codeQuery).lean();
      if (codeSearch && codeSearch.length > 0) {
        codeSearch.forEach((result) => {
          searchresults.push(result);
        });
      }
      const descriptionQuery = {
        description: new RegExp(data, "i"),
      };
      const descriptionSearch = await itemCatalogueModel
        .find(descriptionQuery)
        .lean();
      if (descriptionSearch && descriptionSearch.length > 0) {
        descriptionSearch.forEach((result) => {
          searchresults.push(result);
        });
      }
      let statusQuery = { status: null };
      if (new RegExp(data, "i").test("active")) {
        statusQuery = { status: true };
      } else if (new RegExp(data, "i").test("inactive")) {
        statusQuery = { status: false };
      }
      const statusSearch = await itemCatalogueModel.find(statusQuery).lean();
      if (statusSearch && statusSearch.length > 0) {
        statusSearch.forEach((result) => {
          searchresults.push(result);
        });
      }
      return searchresults;
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  };
  delete = async (query, req, res) => {
    try {
      const DB = await switchDB(req.subdomain, itemCatalogueSchema);
      const itemCatalogueModel = await getDBModel(DB, "itemCatalogue");
      // find and update record in mongoDB
      return await itemCatalogueModel.deleteOne(query);
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  };
}

module.exports = new ItemCatalogueService();
