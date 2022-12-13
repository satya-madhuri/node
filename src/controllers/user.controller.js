const User = require("../schema/user.schema");

module.exports.getUsersWithPostCount = async (req, res) => {
  try {
    //TODO: Implement this API
    const pageSize = req.query.limit ? parseInt(req.query.limit) : 10;
    const pageNumber = req.query.page ? parseInt(req.query.page) : 1;
    const PostDataDetails = [

      {
        $lookup: {
          from: "posts",
          localField: "_id",
          foreignField: "userId",
          as: "posts",
        },
      },
      {
        $project: {
          name: 1,
          posts: { $size: "$posts" }
        }
      },
      {
        $facet: {
          pagination: [
            { $count: "totalDocs" },
            { $addFields: { page: pageNumber } },
            { $addFields: { limit: pageSize } },
            { $addFields: { pagingCounter: pageNumber } },
          ],
          data: [
            { $skip: (pageNumber - 1) * pageSize },
            { $limit: pageSize },
          ], // add projection here wish you re-shape the docs
        },
      },

      { $addFields: { 'pagination.totalPages': "$pagination.totalDocs" } },
      { $unwind: "$pagination" },
      { $unwind: "$pagination.totalPages" },
      { $addFields: { 'pagination.totalPages': { $divide: ["$pagination.totalPages", pageSize] } } },
      { $addFields: { 'pagination.hasPrevPage': { $cond: { if: { $gt: [pageNumber, "$pagination.totalPages"] }, then: true, else: false } } } },
      { $addFields: { 'pagination.hasNextPage': { $cond: { if: { $lt: [pageNumber, "$pagination.totalPages"] }, then: true, else: false } } } },
      { $addFields: { 'pagination.prevPage': { $cond: { if: { $gt: [pageNumber, "$pagination.totalPages"] }, then: pageNumber-1, else: null } } } },
      { $addFields: { 'pagination.nextPage': { $cond: { if: { $lt: [pageNumber, "$pagination.totalPages"] }, then: pageNumber+1, else: null } } } },
    ];

    const userData = await User.aggregate(PostDataDetails)

    res.status(200).json({
      message: "Implement this API",
      data: {
        users: userData[0].data,
        pagination: userData[0].pagination
        
      },
    });
  } catch (error) {
    res.send({ error: error.message });
  }
};
