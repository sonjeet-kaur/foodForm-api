const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const APIFeatures = require('./../utils/apiFeatures');
// const Market = require('../models/marketModel');

exports.deleteOne = Model =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);

    if (!doc) {
      return next(new AppError('No document found with that ID', 404));
    }

    res.status(204).json({
      status: 'success',
      data: null
    });
  });

exports.updateOne = Model =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!doc) {
      return next(new AppError('No document found with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        data: doc
      }
    });
  });

exports.createOne = Model =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.create(req.body);

    res.status(201).json({
      status: 'success',
      data: {
        data: doc
      }
    });
  });

exports.getOne = (Model, popOptions) =>
  catchAsync(async (req, res, next) => {
    let query = Model.findById({_id:req.params.id},{password:0});
    if (popOptions) query = query.populate(popOptions);
    const doc = await query;
    const checkSponser =await  Model.findOne({username:doc.sponsor_id},{user_id:1})
   // console.log(checkSponser);
   if(checkSponser){
    var sponser = checkSponser.user_id;
   }else{
    var sponser = '';
   }

    if (!doc) {
      return next(new AppError('No document found with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        data: doc, sponsor_user_id: sponser
      }
    });
  });



exports.getIncomesbyType = Model =>
  catchAsync(async (req, res, next) => {
    // To allow for nested GET reviews on tour (hack)
    let filter = {username: req.user.username};
  
    // if (req.params.tourId) filter = { tour: req.params.tourId };
    // if (req.params.username) filter = { username: req.params.username };
    
    // const { startDate} = req.query;
    // if (startDate) {
    //   filter.createdAt = { $gte: new Date(startDate) };
    // }
    if(req.query.type){
      filter.type = req.query.type;
    }
 
    const features = new APIFeatures(Model.find(filter, {_id:0, updated_at:0}), req.query)
      // .search()
      .filter()
      .sort()
      .limitFields()
      .paginate();

    const doc = await features.query;

    // req.query.username = req.params.username;
    const excludedFields = ['sort'];
    excludedFields.forEach(el => delete req[el]);

    const pipeline = [
      {
        $match: { type: req.query.type, username: req.user.username}
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: { $ifNull: ['$amount', 0] } }
        }
      }
    ];
  
    const ins = await Model.aggregate(pipeline);
    if(ins[0]){
      var totalAmount = ins[0].totalAmount;
    }else{
      var totalAmount = 0;
    }
    const total = await Model.countDocuments(filter);
    let filteredDoc = [];
    for (const data of doc) {

      const { _id, updated_at, ...rest } = data;
      filteredDoc.push(rest);
    }

    res.status(200).json({
      status: 'success',
      results: doc.length,
      total,
      totalAmount,
      data: {
        data: doc
      }
     
    });
  });

  // all incomes 

  exports.getAllTypeIncomes = Model =>
  catchAsync(async (req, res, next) => {
    // To allow for nested GET reviews on tour (hack)
    let filter = {username: req.user.username};
  
    // if (req.params.tourId) filter = { tour: req.params.tourId };
    // if (req.params.username) filter = { username: req.params.username };
    if(req.query.type){
      filter.type = req.query.type;
    }
    const features = new APIFeatures(Model.find(filter, {_id:0, updated_at:0}), req.query)
      // .search()
      .filter()
      .sort()
      .limitFields()
      .paginate();

    const doc = await features.query;
    // req.query.username = req.params.username;
    const excludedFields = ['sort'];
    excludedFields.forEach(el => delete req[el]);

    const pipeline = [
      {
        $match: req.query
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: { $ifNull: ['$amount', 0] } }
        }
      }
    ];

    const ins = await Model.aggregate(pipeline);
    if(ins[0]){
      var totalAmount = ins[0].totalAmount;
    }else{
      var totalAmount = 0;
    }
    const total = await Model.countDocuments(filter);
    let filteredDoc = [];
    for (const data of doc) {

      const { _id, updated_at, ...rest } = data;
      filteredDoc.push(rest);
    }
    res.status(200).json({
      status: 'success',
      results: doc.length,
      total,
      totalAmount,
      data: {
        data: doc
      }
     
    });
  });


exports.getAll = Model =>
  catchAsync(async (req, res, next) => {
    // To allow for nested GET reviews on tour (hack)
    let filter = {username: req.user.username};
    // if (req.params.tourId) filter = { tour: req.params.tourId };
    // if (req.params.username) filter = { username: req.params.username };

    const features = new APIFeatures(Model.find(filter), req.query)
      // .search()
      .filter()
      .sort()
      .limitFields()
      .paginate();
    const doc = await features.query;
    // req.query.username = req.params.username;
    const excludedFields = ['sort'];
    excludedFields.forEach(el => delete req[el]);
    const total = await Model.countDocuments(filter);
    res.status(200).json({
      status: 'success',
      results: doc.length,
      total,
      data: {
        data: doc
      }
    });
  });


exports.getAllOr = Model =>
  catchAsync(async (req, res, next) => {
    // To allow for nested GET reviews on tour (hack)
    let filter = {};
    // if (req.params.tourId) filter = { tour: req.params.tourId };
    // if (req.params.username) filter = { username: req.params.username };

    const features = new APIFeatures(Model.find(filter), req.query)
      // .search()
      .filterOr()
      .sort()
      .limitFields()
      .paginate();
    const doc = await features.query;
    // req.query.username = req.params.username;
    const excludedFields = ['sort'];
    excludedFields.forEach(el => delete req[el]);
    // const total = await Model.countDocuments(excludedFields);
    const totals = {
      $or: [
        { 'from': req.query.from },
        { 'to': req.query.to }
      ]
    };
    const total = await Model.countDocuments(totals);

    res.status(200).json({
      status: 'success',
      results: doc.length,
      total,
      data: {
        data: doc
      }
    });
  });






exports.getTradeAll = Model =>
  catchAsync(async (req, res, next) => {
    // To allow for nested GET reviews on tour (hack)
    let filter = {};
    // if (req.params.tourId) filter = { tour: req.params.tourId };
    if (req.params.username) filter = { username: req.params.username };

    const features = new APIFeatures(Model.find(filter), req.query)
      .search()
      .filter()
      .sort()
      .limitFields()
      .paginate();
    const doc = await features.query;
    req.query.username = req.params.username;
    const total = await Model.countDocuments(req.query);

    res.status(200).json({
      status: 'success',
      results: doc.length,
      total,
      data: {
        data: doc
      }
    });
  });



exports.getIncomeHistory = Model =>
  catchAsync(async (req, res, next) => {
    let filter = {};
    if (req.params.username) filter = { username: req.params.username };

    const features = new APIFeatures(Model.find(filter), req.query)
      .search()
      .filter()
      .sort()
      .limitFields()
      .paginate();

    let doc = await features.query;

    p2 = [];
    req.query.username = req.params.username;
    const total = await Model.countDocuments(req.query);

    const promises = await doc.map(async (value, key) => {
      const val = await Market.find({ coin_id: value.coin_id, symbol: value.symbol }, 'current_price');
      value.value = (value.amount * val[0].current_price);

      return value;
    })

    await Promise.all(promises).then(resss => {
      return res.status(200).json({
        status: 'success',
        total,
        results: doc.length,
        data: {
          data: resss
        }
      });
      if (resss[0].status != '') {
        return res.status(200).json(resss);
      }
    });

  });




exports.getReferralHistory = Model =>
  catchAsync(async (req, res, next) => {
    // To allow for nested GET reviews on tour (hack)
    let filter = {};
    if (req.user.username) filter = { referal: req.user.username };

    const features = new APIFeatures(Model.find(filter), req.query)
      .search()
      .filter()
      .sort()
      .limitFields()
      .paginate();

    const doc = await features.query;
    req.query.referal = req.user.username;
    const total = await Model.countDocuments(req.query);

    res.status(200).json({
      status: 'success',
      results: doc.length,
      total,
      data: {
        data: doc
      }
    });
  });

exports.getFullData = Model =>
  catchAsync(async (req, res, next) => {

    // To allow for nested GET reviews on tour (hack)
    let filter = {};
    // if (req.params.tourId) filter = { tour: req.params.tourId };
    // if (req.params.username) filter = { };

    const features = new APIFeatures(Model.find(filter), req.query)
      .search()
      .filter()
      .sort()
      .limitFields()
      .paginate();
    const doc = await features.query;
    // req.query.username = req.params.username;
    const total = await Model.countDocuments(req.query);

    res.status(200).json({
      status: 'success',
      results: doc.length,
      total,
      data: {
        data: doc
      }
    });
  });





// exports.getElpMarket = Model =>
//   catchAsync(async (req, res, next) => {
//     // To allow for nested GET reviews on tour (hack)
//     let filter = {};
//     // if (req.user.username) filter = { referal: req.user.username };

//     const features = new APIFeatures(Model.find(filter), req.query)
//       .search()
//       .filter()
//       .sort()
//       .limitFields()
//       .paginate();

//     const doc = await features.query;
//     // req.query.referal = req.user.username;
//     const total = await Model.countDocuments(req.query);

//     res.status(200).json({
//       status: 'success',
//       results: doc.length,
//       total,
//       data: {
//         data: doc
//       }
//     });
//   });




exports.getElpMarket = Model =>
  catchAsync(async (req, res, next) => {
    let filter = {};
    if (req.params.username) filter = { username: req.params.username };

    const features = new APIFeatures(Model.find(filter), req.query)
      .search()
      .filter()
      .sort()
      .limitFields()
      .paginate();

    let doc = await features.query;

    p2 = [];
    p3 = [];

    req.query.username = req.params.username;
    const total = await Model.countDocuments(req.query);

    const promises = await doc.map(async (value, key) => {
      const val = await Market.find({ coin_id: value.coin_id, symbol: value.symbol });
      p3 = val;
      // value.value = (value.amount * val[0].current_price);
      // return value;
    })

    await Promise.all(promises).then(resss => {
      return res.status(200).json({
        status: 'success',
        total,
        results: doc.length,
        data: {
          data: doc,
          market: p3
        }
      });
      if (resss[0].status != '') {
        return res.status(200).json(resss);
      }
    });

  });


exports.getChartMannual = Model =>
  catchAsync(async (req, res, next) => {
    // To allow for nested GET reviews on tour (hack)
    let filter = {};
    // if (req.params.tourId) filter = { tour: req.params.tourId };
    if (req.params.username) filter = {};

    const features = new APIFeatures(Model.find(filter), req.query)
      .search()
      .filter()
      .sort()
      .limitFields()
      .paginate();

    const doc = await features.query;
    req.query.username = req.params.username;
    const total = await Model.countDocuments(req.query);
    const p3 = [];
    const p4 = [];
    const promises = await doc.map(async (value, key) => {
      // const val = await Market.find({ coin_id: value.coin_id, symbol: value.symbol });
      // var current_date = Number(value.price[0].x.toISOString().substr(0,10));
      // var current_date = Number(value.price[0].x.toString().substr(0,10));
      var current_date = Number(value.price[0].x);
      // console.log(value.price)
      // p3 = { x: current_date.toString(), y: value.price[0].y,data };
      p3.push({ time: current_date, open: value.open, high: value.high, low: value.low, close: value.close });
      p4.push({ time: current_date, value: (value.close) });

      return { p3, p4 };
    })
    // console.log(p3)
    await Promise.all(promises).then(resss => {
      // console.log(resss);
      return res.status(200).json({
        status: 'success',
        total,
        results: doc.length,
        data: {
          candel: p3,
          area: p4
        }
      });
    });

  });



exports.getAlls = Model =>
  catchAsync(async (req, res, next) => {
    // To allow for nested GET reviews on tour (hack)
    let filter = {};
    // if (req.params.tourId) filter = { tour: req.params.tourId };
    if (req.params.username) filter = {};

    const features = new APIFeatures(Model.find(filter), req.query)
      .search()
      .filter()
      .sort()
      .limitFields()
      .paginate();

    const doc = await features.query;
    req.query.username = req.params.username;
    const total = await Model.countDocuments(req.query);

    res.status(200).json({
      status: 'success',
      results: doc.length,
      total,
      data: {
        data: doc
      }
    });
  });



  



