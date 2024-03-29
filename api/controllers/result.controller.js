const Result = require("../../models/result.model");

module.exports = {
    post: (req, res) => {
        let newResult = new Result({
          test_id: req.body.testId,
          user: {
            facebook_id: req.user.id,
            display_name: req.user.displayName,
            ip: req.ip,
            software: req.get("User-Agent")
          },
          leaves_area_times: 0,
          started_time: new Date(),
          last_updated: new Date()
        });
        newResult.save((err, result) => {
          if (err) {
            return res.status(500).json({error: err});
          }
          return res.status(200).json({result});
        })
    },

    put: async (req, res) => {
        let response = {};
        let matchedResult;
        try {
            matchedResult = await Result.findById(req.params.id);
        } catch (err) {
            return res.status(500).json({error: err});
        }
        if (!matchedResult) {
          return res.status(404).json({error: "Không tìm thấy bản lưu kết quả."});
        }
        matchedResult.leaves_area_times = req.body.leavesAreaTimes;
        matchedResult.choices = [...req.body.choices];
        matchedResult.last_updated = new Date();
        if (req.body.isFinished) matchedResult.finished_time = new Date();
        matchedResult.save((err, result) => {
          res.status(200).json(result);
        })
        return;
    },

    delete: (req, res) => {
        Result.findByIdAndDelete(req.params.id, (err) => {
          if (err) res.status(500).json({error: err});
          res.json({ message: 'Tải lại trang để có hiệu lực.' });
        })
    }
};

