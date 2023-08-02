class SourceBankUtils {
  constructor() {}
  validateSourceBank = async (sourceBank, req) => {
    return null;
  };

  transformSourceTargetBank = async (
    allSourceBanks,
    banksList,
    branchesList
  ) => {
    let requiredList = [];
    for (let index = 0; index < allSourceBanks.length; index++) {
      const sourceBank = allSourceBanks[index];
      const targetBranches = sourceBank.targetBranches;
      const sourceBankDetails = banksList.find(
        (bank) => bank.uuid == sourceBank.bankUUID
      );
      const sourceBranchDetails = branchesList.find(
        (branch) => branch.uuid == sourceBank.branchUUID
      );
      if (targetBranches?.length > 0) {
        for (
          let targetBankIndex = 0;
          targetBankIndex < targetBranches?.length;
          targetBankIndex++
        ) {
          const targetBank = targetBranches[targetBankIndex];
          const targetBankDetails = banksList.find(
            (bank) => bank.uuid == targetBank.bankUUID
          );
          const targetBranchDetails = branchesList.find(
            (branch) => branch.uuid == targetBank.branchUUID
          );
          const sourceTargetBankDetails = {
            uuid: sourceBank?.uuid,
            sourceBankId: sourceBankDetails?.bankId,
            sourceBankName: sourceBankDetails?.name,
            sourceBranchId: sourceBranchDetails?.branchId,
            sourceBranchName: sourceBranchDetails?.name,
            targetBankId: targetBankDetails?.bankId,
            targetBankName: targetBankDetails?.name,
            targetBranchId: targetBranchDetails?.branchId,
            targetBranchName: targetBranchDetails?.name,
          };
          requiredList.push(sourceTargetBankDetails);
        }
      }
    }
    return requiredList;
  };
}
module.exports = new SourceBankUtils();
