const { knexInstance } = require("../../config/db");

const signatureService = {
  async upgradeDowngradePackage(companyId, newPackageId) {
    const db = await knexInstance();

    // 1️⃣ Get the current subscription of the company
    const currentSubscription = await db("signatures")
      .where({ company_id: companyId, status: "active" })
      .first();

    if (!currentSubscription) {
      throw new Error("Subscription not found");
    }

    // 2️⃣ Get details of the new package
    const newPackage = await db("signatures_packages")
      .where({ id: newPackageId })
      .first();

    if (!newPackage) {
      throw new Error("Package not found");
    }

    // 3️⃣ Check the number of active job postings
    const activeJobs = await db("jobs")
      .where({ company_id: companyId, status: "active" })
      .count("* as total");

    const totalActiveJobs = activeJobs[0].total;

    // 4️⃣ If downgrading, disable excess job postings
    if (newPackage.vacancy_limit < totalActiveJobs) {
      const excess = totalActiveJobs - newPackage.vacancy_limit;
      await db("jobs")
        .where({ company_id: companyId, status: "active" })
        .orderBy("created_at", "desc") // Disable the most recent jobs first
        .limit(excess)
        .update({ status: "disabled" });
    }

    // 5️⃣ Update the company's subscription
    await db("signatures")
      .where({ company_id: companyId })
      .update({ package_id: newPackageId });

    return { message: "Package updated successfully" };
  },
};

module.exports = signatureService;