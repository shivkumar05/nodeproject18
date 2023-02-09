const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const tagModel = require("../Models/tagModel");
const userModel = require("../Models/userModel");
const profileModel = require("../Models/profile");
const wicketModel = require("../Models/wicketModel");
const battingModel = require("../Models/battingModel");
const bowlingModel = require("../Models/bowlingModel");
const bow_batModel = require("../Models/bow_batModel");
const routineModel = require("../Models/routineModel");
const myDrillModel = require("../Models/myDrillModel");
const categoryModel = require("../Models/categoryModel");
const powerTestModel = require("../Models/power_testModel");
const readinessSurveyModel = require("../Models/readinessSurvey");
const strengthTestModel = require("../Models/strength_testModel");
const academy_coachModel = require('../Models/academy_coachModel');
const recommendationModel = require("../Models/recommendationModel");
const academyProfile = require("../Models/academyProfile");

//==========================[user register]==============================
const createUser = async function (req, res) {
    try {
        let data = req.body;
        let { name, phone, join_as, signup_as, email, password, academy_name } = data

        if (await userModel.findOne({ phone: phone }))
            return res.status(400).send({ message: "Phone already exist" })

        if (await userModel.findOne({ email: email }))
            return res.status(400).send({ message: "Email already exist" })

        const encryptedPassword = bcrypt.hashSync(password, 12)
        req.body['password'] = encryptedPassword;

        let savedData = await userModel.create(data)
        res.status(201).send({ status: true, data: savedData })
    }
    catch (err) {
        res.status(500).send({ status: false, error: err.message })
    }
};
//==========================[user login]==============================

const userLogin = async function (req, res) {
    try {
        let data = req.body
        let { email, password } = data;

        let user = await userModel.findOne({ email: email })

        if (!user) {
            return res.status(400).send({
                status: false,
                msg: "Email and Password is Invalid"
            })
        };

        let compared = await bcrypt.compare(password, user.password)
        if (!compared) {
            return res.status(400).send({
                status: false,
                message: "Your password is invalid"
            })
        };

        let UserProfile = await profileModel.findOne({ userId: user._id }).select({ _id: 0, createdAt: 0, updatedAt: 0, __v: 0 });
        let type = UserProfile ? "Yes" : "No";
        user.user_details_submit = type;



        let token = jwt.sign({
            userId: user._id,
        }, "project")

        let Questions = await bow_batModel.findOne({ userId: user._id }).select({ _id: 0, createdAt: 0, updatedAt: 0, __v: 0 });
        user.userQuestion = Questions;

        return res.status(200).send({
            status: true,
            msg: "User login successfull",
            data: {
                userId: user._id,
                name: user.name,
                phone: user.phone,
                join_as: user.join_as,
                email: user.email,
                password: user.password,
                signup_as: user.signup_as,
                user_details_submit: user.user_details_submit,
                userProfile: UserProfile,
                userQuestion: user.userQuestion,
                token: token,
            }
        })
    }
    catch (error) {
        return res.status(500).send({
            status: false,
            msg: error.message
        })
    }
};
//=============[ get contact ]================
const getContact = async function (req, res) {
    try {
        let email = req.body.email;

        let user = await userModel.findOne({ email: email })

        if (!user) {
            return res.status(400).send({
                status: false,
                msg: "This Email are not Registered."
            })
        } else {
            return res.status(200).send({
                status: true,
                msg: "Get Contact",
                data: {
                    phone: user.phone
                }
            })
        }
    }
    catch (error) {
        return res.status(500).send({
            status: false,
            msg: error.message
        })
    }
};
//==========================[Update Password]=================
const updatePassword = async function (req, res) {
    try {
        let data = req.body
        let { email, password } = data;

        let user2 = await userModel.findOne({ email: email });

        const encryptedPassword = bcrypt.hashSync(password, 12)
        data.password = encryptedPassword;

        let user = await userModel.findOneAndUpdate({ email: email }, { $set: { password: encryptedPassword } }, { new: true });

        return res.status(200).send({
            status: true,
            message: "Password Updated Successfully"
        })
    }
    catch (error) {
        return res.status(500).send({
            status: false,
            msg: error.message
        })
    }
}
//===========================[create bat_bow]===============================

const bow_bat = async function (req, res) {
    try {
        let data = req.body;
        let userid = req.params.userId;

        let { bat_hand, bowl_hand, batting_order, bowling_order, wicket_keeper, userId } = data
        data.userId = userid;

        const actionCreated = await bow_batModel.create(data)

        return res.status(201).send({
            status: true,
            message: "Success",
            data: actionCreated
        })
    }
    catch (error) {
        return res.status(500).send({
            status: false,
            message: error.message
        })
    }
};
//==========================[progress screen (batting)]==============================

const createBattings = async function (req, res) {
    try {
        let data = req.body
        //***********check if the body is empty**************//
        if (Object.keys(data).length == 0) {
            return res.status(400).send({
                status: false,
                message: "Body should  be not Empty please enter some data to create batting"
            })
        }
        const battingCreated = await battingModel.create(data)

        return res.status(201).send({
            status: true,
            message: "Battings created successfully",
            data: battingCreated
        })
    }
    catch (error) {
        return res.status(500).send({
            status: false,
            message: error.message
        })
    }
};
//==========================[progress screen (bowling)]==============================

const createBowlings = async function (req, res) {
    try {
        let data = req.body
        //***********check if the body is empty**************//
        if (Object.keys(data).length == 0) {
            return res.status(400).send({
                status: false,
                message: "Body should  be not Empty please enter some data to create Bowlings"
            })
        }
        const bowlingCreated = await bowlingModel.create(data)

        return res.status(201).send({
            status: true,
            message: "Bowling created successfully",
            data: bowlingCreated
        })
    }
    catch (error) {
        return res.status(500).send({
            status: false,
            message: error.message
        })
    }
};
//==========================[progress screen (wicket)]==============================

const createWickets = async function (req, res) {
    try {
        let data = req.body
        if (Object.keys(data).length == 0) {
            return res.status(400).send({
                status: false,
                message: "Body should  be not Empty please enter some data to create Wickets"
            })
        }
        const wicketCreated = await wicketModel.create(data)
        return res.status(201).send({
            status: true,
            message: "Wicket created successfully",
            data: wicketCreated
        })
    }
    catch (error) {
        return res.status(500).send({
            status: false,
            message: error.message
        })
    }
};
//==========================[create category]==============================
const category = async function (req, res) {
    try {
        let data = req.body;

        let category = await categoryModel.create(data);
        let obj = {}
        obj["category_id"] = category.category_id
        obj["category_name"] = category.category_name

        return res.status(201).send({
            message: "category created successfully",
            data: obj
        })
    }
    catch (error) {
        return res.status(500).send({
            status: false,
            message: error.message
        })
    }
};
//==========================[Get Category]==============================
const getCategory = async function (req, res) {
    try {
        let body = req.body;

        const Category = await categoryModel.find(body).select({ category_id: 1, category_name: 1, _id: 0 });

        return res.status(200).send({
            status: true,
            message: "success",
            data: Category
        })
    }
    catch (error) {
        return res.status(500).send({
            status: false,
            message: error.message
        })
    }
};
//==========================[create tag]==============================

const tag = async function (req, res) {
    try {
        let data = req.body;

        let tags = await tagModel.create(data);
        let obj = {}
        obj["tag_id"] = tags.tag_id
        obj["tag"] = tags.tag
        obj["category_id"] = tags.category_id
        obj["category_name"] = tags.category_name

        return res.status(201).send({
            message: "tags created successfully",
            data: obj
        })
    }
    catch (error) {
        return res.status(500).send({
            status: false,
            message: error.message
        })
    }
};
//========================================================================

const getTags = async function (req, res) {
    try {
        let body = req.body;

        const Tag = await tagModel.find(body).select({ tag_id: 1, tag: 1, category_id: 1, category_name: 1, _id: 0 });

        return res.status(200).send({
            status: true,
            data: Tag
        })
    }
    catch (error) {
        return res.status(500).send({
            status: false,
            message: error.message
        })
    }
};
//===================================================

const createRoutine = async function (req, res) {
    try {
        let data = req.body;
        let userid = req.params.userId;

        let { drills, date, time, category, drill_id, userId, routineId } = data;
        data.userId = userid;

        let RoutineTime = await routineModel.findOne({ date: date, time: time });
        if (RoutineTime) {
            return res.status(400).send({ status: false, message: "You already have a routine set for this time" })
        }
        
        let createRoutine = await routineModel.create(data);
        

        return res.status(201).send({
            message: "Routine set successfully",
            data: {
                userId: createRoutine.userId,
                drills: createRoutine.drills,
                date: createRoutine.date,
                time: createRoutine.time,
                category: createRoutine.category,
                drill_id: createRoutine.drill_id,
                routineId: createRoutine._id,
            }
        })

    }
    catch (error) {
        return res.status(500).send({
            status: false,
            message: error.message
        })
    }
};


//=======================================================

const getRoutine = async function (req, res) {
    try {
        let data = req.query;
        let userid = req.params.userId;

        let { date } = data;

        let filter = {}

        if (date) {
            filter.date = date;
        }
        if (userid) {
            filter.userId = userid
        }

        const getDrills = await routineModel.find({ $or: [filter] }).sort({ time: data.time })

        return res.status(200).send({
            status: true,
            data: getDrills
        })
    }
    catch (error) {
        return res.status(500).send({
            status: false,
            message: error.message
        })
    }
};
//=======================================================

const deleteRoutine = async function (req, res) {
    try {
        let routineId = req.query.routineId;

        let updateRoutine = await routineModel.findByIdAndDelete({ _id: routineId })

        res.status(200).send({ status: true, message: 'sucessfully deleted' })

    }
    catch (error) {
        return res.status(500).send({
            status: false,
            message: error.message
        })
    }
}
//======================================================================
const getMyDrills = async function (req, res) {
    try {
        let data = req.query;
        let userid = req.params.userId;
        let { category, title } = data;

        let filter = {}

        if (category) {
            filter.category = category;
        }
        if (title) {
            filter.title = title;
        }

        const drills = await myDrillModel.find({ userId: userid, $or: [data, filter] }).select({ createdAt: 0, updatedAt: 0, __v: 0 });

        let arr = [];
        for (let i = 0; i < drills.length; i++) {
            arr.push(drills[i])
        }

        return res.status(200).send({
            status: true,
            message: "success",
            data: arr
        })
    }
    catch (error) {
        return res.status(500).send({
            status: false,
            message: error.message
        })
    }
};
//========================[Update Drill]===============
const updateDrill = async function (req, res) {
    try {
        let drillId = req.body.drillId;
        let userid = req.params.userId;

        let filteredData = { isCompleted: true }

        let drills = await myDrillModel.findByIdAndUpdate({ _id: drillId }, { $set: filteredData }, { new: true })

        return res.status(200).send({
            status: true,
            message: "Drill Updated"
        })
    }
    catch (error) {
        return res.status(500).send({
            status: false,
            message: error.message
        })
    }
}
//==========================[part-2 (readinessSurveyModel)]===============================

const readinessSurvey = async function (req, res) {
    try {
        let data = req.body

        const createReadinessSurvey = await readinessSurveyModel.create(data)

        let obj = {}
        obj["Sleep"] = createReadinessSurvey.Sleep
        obj["Mood"] = createReadinessSurvey.Mood
        obj["Energy"] = createReadinessSurvey.Energy
        obj["Stressed"] = createReadinessSurvey.Stressed
        obj["Sore"] = createReadinessSurvey.Sore
        obj["Heart_rate"] = createReadinessSurvey.Heart_rate
        obj["Urine_color"] = createReadinessSurvey.Urine_color

        return res.status(201).send({
            status: true,
            message: "Created successfully",
            data: obj
        })
    }
    catch (error) {
        return res.status(500).send({
            status: false,
            message: error.message
        })
    }
};
//==============================[part-2 (Test Details)]========================
const createPowerTest = async function (req, res) {
    try {
        let data = req.body;

        const powerTest = await powerTestModel.create(data);

        let obj = {};

        obj["vertical_jump"] = powerTest.vertical_jump
        obj["squat_jump"] = powerTest.squat_jump
        obj["standing_broad_jump"] = powerTest.standing_broad_jump
        obj["ball_chest_throw"] = powerTest.ball_chest_throw
        obj["hang_cleans"] = powerTest.hang_cleans
        obj["cleans"] = powerTest.cleans
        obj["power_cleans"] = powerTest.power_cleans
        obj["snatch_floor"] = powerTest.snatch_floor
        obj["hang_snatch"] = powerTest.hang_snatch
        obj["split_jerk"] = powerTest.split_jerk

        return res.status(201).send({
            status: true,
            message: "Created successfully",
            data: obj
        })
    }
    catch (error) {
        return res.status(500).send({
            status: false,
            message: error.message
        })
    }
};

//====================================[part-2 (Stength Test)]======================

const createStrengthTest = async function (req, res) {
    try {
        let data = req.body;

        const strengthTest = await strengthTestModel.create(data);

        let obj = {};

        obj["back_squats"] = strengthTest.back_squats
        obj["front_squats"] = strengthTest.front_squats
        obj["conventional_deadlifts"] = strengthTest.conventional_deadlifts
        obj["barbell_bench_press"] = strengthTest.barbell_bench_press
        obj["barbell_bench_pulls"] = strengthTest.barbell_bench_pulls

        return res.status(201).send({
            status: true,
            message: "Created successfully",
            data: obj
        })
    }
    catch (error) {
        return res.status(500).send({
            status: false,
            message: error.message
        })
    }
}
//===================[Get Past Drills]================
const getPastDrill = async function (req, res) {
    try {
        let data = req.query;
        let userid = req.params.userId;

        let { category, title } = data;

        let filter = {}

        if (category) {
            filter.category = category;
        }
        if (title) {
            filter.title = title;
        }

        const drills = await myDrillModel.find({ userId: userid, isCompleted: true, $or: [data, filter] }).select({ createdAt: 0, updatedAt: 0, __v: 0 });

        let lastIndex = drills.length - 1;
        let lastObject = drills[lastIndex];

        let arr = [];

        for (var i = 0; i < drills.length; i++) {
            data.videoId = drills[i]._id
            arr.push(data.videoId)
        }

        let Allrecommendations = await recommendationModel.find().select({ anecdote_no: 1, message: 1, audioFile: 1, audiolength: 1, manual: 1, createdAt: 1 });

        let obj = [{
            _id: lastObject._id,
            title: lastObject.title,
            category: lastObject.category,
            repetation: lastObject.repetation,
            sets: lastObject.sets,
            videos: lastObject.videos,
            userId: lastObject.userId,
            isCompleted: lastObject.isCompleted,
            recommendation: Allrecommendations
        }]

        return res.status(200).send({
            status: true,
            message: "success",
            data: obj
        })
    }
    catch (error) {
        return res.status(500).send({
            status: false,
            msg: error.message
        })
    }
}
//************************************[ Acedemy/Coach Section]*************************************
//==========================[Acedmy/coach register]==============================
const createAcademy = async function (req, res) {
    try {
        let data = req.body;
        let { email, phone, join_as, academy_name, password } = data

        if (await academy_coachModel.findOne({ phone: phone }))
            return res.status(400).send({ message: "Phone already exist" })

        if (await academy_coachModel.findOne({ email: email }))
            return res.status(400).send({ message: "Email already exist" })

        const encryptedPassword = bcrypt.hashSync(password, 12)
        req.body['password'] = encryptedPassword;

        let savedData = await academy_coachModel.create(data)
        res.status(201).send({ status: true, data: savedData })
    }
    catch (err) {
        res.status(500).send({ status: false, error: err.message })
    }
};
//==========================[user login]==============================

const AcademyLogin = async function (req, res) {
    try {
        let data = req.body
        let { email, password } = data;

        let academy = await academy_coachModel.findOne({ email: email })

        if (!academy) {
            return res.status(400).send({
                status: false,
                msg: "Email and Password is Invalid"
            })
        };

        let compared = await bcrypt.compare(password, academy.password)
        if (!compared) {
            return res.status(400).send({
                status: false,
                message: "Your password is invalid"
            })
        };

        let token = jwt.sign({
            userId: academy._id,
        }, "project");

        let AcademyProfile = await academyProfile.findOne({ userId: academy._id }).select({ _id: 0, createdAt: 0, updatedAt: 0, __v: 0 });
        let type2 = AcademyProfile ? true : false;
        academy.academy_details_submit = type2;

        return res.status(200).send({
            status: true,
            msg: "User login successfull",
            data: {
                userId: academy._id,
                phone: academy.phone,
                join_as: academy.join_as,
                email: academy.email,
                password: academy.password,
                academy_details_submit: academy.academy_details_submit,
                token: token,
                userProfile: AcademyProfile
            }
        })
    }
    catch (error) {
        return res.status(500).send({
            status: false,
            msg: error.message
        })
    }
};
// =============================================================================


module.exports = { AcademyLogin, createUser, userLogin, getContact, createBattings, createBowlings, createWickets, bow_bat, createRoutine, deleteRoutine, getRoutine, category, getCategory, getTags, tag, getMyDrills, readinessSurvey, createPowerTest, createStrengthTest, createAcademy, updateDrill, updatePassword, getPastDrill }

