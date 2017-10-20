var require = meteorInstall({"imports":{"api":{"classes.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                             //
// imports/api/classes.js                                                                                      //
//                                                                                                             //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                               //
module.export({                                                                                                // 1
	Classes: function () {                                                                                        // 1
		return Classes;                                                                                              // 1
	},                                                                                                            // 1
	Subjects: function () {                                                                                       // 1
		return Subjects;                                                                                             // 1
	},                                                                                                            // 1
	Reviews: function () {                                                                                        // 1
		return Reviews;                                                                                              // 1
	}                                                                                                             // 1
});                                                                                                            // 1
var Mongo = void 0;                                                                                            // 1
module.watch(require("meteor/mongo"), {                                                                        // 1
	Mongo: function (v) {                                                                                         // 1
		Mongo = v;                                                                                                   // 1
	}                                                                                                             // 1
}, 0);                                                                                                         // 1
var HTTP = void 0;                                                                                             // 1
module.watch(require("meteor/http"), {                                                                         // 1
	HTTP: function (v) {                                                                                          // 1
		HTTP = v;                                                                                                    // 1
	}                                                                                                             // 1
}, 1);                                                                                                         // 1
var check = void 0;                                                                                            // 1
module.watch(require("meteor/check"), {                                                                        // 1
	check: function (v) {                                                                                         // 1
		check = v;                                                                                                   // 1
	}                                                                                                             // 1
}, 2);                                                                                                         // 1
var Classes = new Mongo.Collection('classes');                                                                 // 5
Classes.schema = new SimpleSchema({                                                                            // 6
	_id: {                                                                                                        // 7
		type: String                                                                                                 // 7
	},                                                                                                            // 7
	classSub: {                                                                                                   // 8
		type: String                                                                                                 // 8
	},                                                                                                            // 8
	classNum: {                                                                                                   // 9
		type: Number                                                                                                 // 9
	},                                                                                                            // 9
	classTitle: {                                                                                                 // 10
		type: String                                                                                                 // 10
	},                                                                                                            // 10
	classAtten: {                                                                                                 // 11
		type: Number                                                                                                 // 11
	},                                                                                                            // 11
	classPrereq: {                                                                                                // 12
		type: [String],                                                                                              // 12
		optional: true                                                                                               // 12
	},                                                                                                            // 12
	classFull: {                                                                                                  // 13
		type: String                                                                                                 // 13
	},                                                                                                            // 13
	classSems: {                                                                                                  // 14
		type: [String]                                                                                               // 14
	}                                                                                                             // 14
});                                                                                                            // 6
var Subjects = new Mongo.Collection('subjects');                                                               // 17
Subjects.schema = new SimpleSchema({                                                                           // 18
	_id: {                                                                                                        // 19
		type: String                                                                                                 // 19
	},                                                                                                            // 19
	subShort: {                                                                                                   // 20
		type: String                                                                                                 // 20
	},                                                                                                            // 20
	subFull: {                                                                                                    // 21
		type: String                                                                                                 // 21
	}                                                                                                             // 21
});                                                                                                            // 18
var Reviews = new Mongo.Collection('reviews');                                                                 // 24
Reviews.schema = new SimpleSchema({                                                                            // 25
	_id: {                                                                                                        // 26
		type: String                                                                                                 // 26
	},                                                                                                            // 26
	user: {                                                                                                       // 27
		type: String                                                                                                 // 27
	},                                                                                                            // 27
	text: {                                                                                                       // 28
		type: String,                                                                                                // 28
		optional: true                                                                                               // 28
	},                                                                                                            // 28
	difficulty: {                                                                                                 // 29
		type: Number                                                                                                 // 29
	},                                                                                                            // 29
	quality: {                                                                                                    // 30
		type: Number                                                                                                 // 30
	},                                                                                                            // 30
	"class": {                                                                                                    // 31
		type: String                                                                                                 // 31
	},                                                                                                            // 31
	//ref to classId                                                                                              // 31
	grade: {                                                                                                      // 32
		type: Number                                                                                                 // 32
	},                                                                                                            // 32
	date: {                                                                                                       // 33
		type: Date                                                                                                   // 33
	},                                                                                                            // 33
	visible: {                                                                                                    // 34
		type: Number                                                                                                 // 34
	}                                                                                                             // 34
}); // defines all methods that will be editing the database so that database changes occur only on the server
                                                                                                               //
Meteor.methods({                                                                                               // 38
	//insert a new review into the reviews database                                                               // 39
	insert: function (review, classId) {                                                                          // 40
		//only insert if all necessary feilds are filled in                                                          // 41
		if (review.text != null && review.diff != null && review.quality != null && review.medGrade != null && classId != undefined && classId != null) {
			//ensure there are no illegal characters                                                                    // 43
			var regex = new RegExp(/^(?=.*[A-Z0-9])[\w:;.,!()"'\/$ ]+$/i);                                              // 44
                                                                                                               //
			if (regex.test(review.text)) {                                                                              // 45
				Reviews.insert({                                                                                           // 46
					text: review.text,                                                                                        // 47
					difficulty: review.diff,                                                                                  // 48
					quality: review.quality,                                                                                  // 49
					"class": classId,                                                                                         // 50
					grade: review.medGrade,                                                                                   // 51
					date: new Date(),                                                                                         // 52
					visible: 0                                                                                                // 53
				});                                                                                                        // 46
				return 1; //success                                                                                        // 55
			} else {                                                                                                    // 56
					return 0; //fail                                                                                          // 57
				}                                                                                                          // 58
		} else {                                                                                                     // 59
				return 0; //fail                                                                                           // 60
			}                                                                                                           // 61
	},                                                                                                            // 62
	//make the reveiw with this id visible, checking to make sure it has a real id                                // 63
	makeVisible: function (review) {                                                                              // 64
		var regex = new RegExp(/^(?=.*[A-Z0-9])/i);                                                                  // 65
                                                                                                               //
		if (regex.test(review._id)) {                                                                                // 66
			Reviews.update(review._id, {                                                                                // 67
				$set: {                                                                                                    // 67
					visible: 1                                                                                                // 67
				}                                                                                                          // 67
			});                                                                                                         // 67
			return 1;                                                                                                   // 68
		} else {                                                                                                     // 69
			return 0;                                                                                                   // 70
		}                                                                                                            // 71
	},                                                                                                            // 72
	//remove the review with this id, checking to make sure the id is a real id                                   // 73
	removeReview: function (review) {                                                                             // 74
		var regex = new RegExp(/^(?=.*[A-Z0-9])/i);                                                                  // 75
                                                                                                               //
		if (regex.test(review._id)) {                                                                                // 76
			Reviews.remove({                                                                                            // 77
				_id: review._id                                                                                            // 77
			});                                                                                                         // 77
			return 1;                                                                                                   // 78
		} else {                                                                                                     // 79
			return 0;                                                                                                   // 80
		}                                                                                                            // 81
	},                                                                                                            // 82
	//update the database to add any new classes in the current semester if they don't already exist. To be called from the admin page once a semester.
	addNewSemester: function (initiate) {                                                                         // 84
		if (initiate && Meteor.isServer) {                                                                           // 85
			//return addAllCourses(findCurrSemester());                                                                 // 86
			return addAllCourses(['FA15']);                                                                             // 87
		}                                                                                                            // 88
	},                                                                                                            // 89
	//get the course (as an object) with this id, checking to make sure the id is real                            // 90
	getCourseById: function (courseId) {                                                                          // 91
		//console.log(courseId);                                                                                     // 92
		var regex = new RegExp(/^(?=.*[A-Z0-9])/i);                                                                  // 93
                                                                                                               //
		if (regex.test(courseId)) {                                                                                  // 95
			var c = Classes.find({                                                                                      // 96
				_id: courseId                                                                                              // 96
			}).fetch()[0]; //console.log(c);                                                                            // 96
                                                                                                               //
			return c;                                                                                                   // 98
		}                                                                                                            // 99
                                                                                                               //
		return null;                                                                                                 // 100
	}                                                                                                             // 101
}); //Code that runs only on the server                                                                        // 38
                                                                                                               //
if (Meteor.isServer) {                                                                                         // 105
	Meteor.startup(function () {                                                                                  // 106
		// code to run on server at startup                                                                          // 106
		//add indexes to collections for faster search                                                               // 107
		Classes._ensureIndex({                                                                                       // 108
			'classSub': 1                                                                                               // 109
		}, {                                                                                                         // 109
			'classNum': 1                                                                                               // 110
		}, {                                                                                                         // 110
			'classTitle': 1                                                                                             // 111
		}, {                                                                                                         // 111
			'_id': 1                                                                                                    // 112
		});                                                                                                          // 112
                                                                                                               //
		Subjects._ensureIndex({                                                                                      // 114
			'subShort': 1                                                                                               // 115
		}, {                                                                                                         // 115
			'subFull': 1                                                                                                // 116
		});                                                                                                          // 116
                                                                                                               //
		Reviews._ensureIndex({                                                                                       // 118
			'class': 1                                                                                                  // 119
		}, {                                                                                                         // 119
			'difficulty': 1                                                                                             // 120
		}, {                                                                                                         // 120
			'quality': 1                                                                                                // 121
		}, {                                                                                                         // 121
			'grade': 1                                                                                                  // 122
		}, {                                                                                                         // 122
			'user': 1                                                                                                   // 123
		}, {                                                                                                         // 123
			'visible': 1                                                                                                // 124
		});                                                                                                          // 124
	}); //code that runs whenever needed                                                                          // 126
	//"publish" classes based on search query. Only published classes are visible to the client                   // 129
                                                                                                               //
	Meteor.publish('classes', function () {                                                                       // 130
		function validClasses(searchString) {                                                                        // 130
			if (searchString != undefined && searchString != "") {                                                      // 131
				console.log("query entered:", searchString);                                                               // 132
				return Classes.find({                                                                                      // 133
					'$or': [{                                                                                                 // 133
						'classSub': {                                                                                            // 134
							'$regex': ".*" + searchString + ".*",                                                                   // 134
							'$options': '-i'                                                                                        // 134
						}                                                                                                        // 134
					}, {                                                                                                      // 134
						'classNum': {                                                                                            // 135
							'$regex': ".*" + searchString + ".*",                                                                   // 135
							'$options': '-i'                                                                                        // 135
						}                                                                                                        // 135
					}, {                                                                                                      // 135
						'classTitle': {                                                                                          // 136
							'$regex': ".*" + searchString + ".*",                                                                   // 136
							'$options': '-i'                                                                                        // 136
						}                                                                                                        // 136
					}, {                                                                                                      // 136
						'classFull': {                                                                                           // 137
							'$regex': ".*" + searchString + ".*",                                                                   // 137
							'$options': '-i'                                                                                        // 137
						}                                                                                                        // 137
					}]                                                                                                        // 137
				}, {                                                                                                       // 133
					limit: 200                                                                                                // 140
				});                                                                                                        // 140
			} else {                                                                                                    // 141
				console.log("no search");                                                                                  // 143
				return Classes.find({}, {                                                                                  // 144
					limit: 200                                                                                                // 145
				});                                                                                                        // 145
			}                                                                                                           // 146
		}                                                                                                            // 147
                                                                                                               //
		return validClasses;                                                                                         // 130
	}()); //"publish" reviews based on selected course and visibility requirements. Only published reviews are visible to the client
                                                                                                               //
	Meteor.publish('reviews', function () {                                                                       // 150
		function validReviews(courseId, visiblity) {                                                                 // 150
			var ret = null; //show valid reviews for this course                                                        // 151
                                                                                                               //
			console.log('getting reviews');                                                                             // 153
                                                                                                               //
			if (courseId != undefined && courseId != "" && visiblity == 1) {                                            // 154
				console.log('in 1');                                                                                       // 155
				ret = Reviews.find({                                                                                       // 156
					"class": courseId,                                                                                        // 156
					visible: 1                                                                                                // 156
				}, {                                                                                                       // 156
					limit: 700                                                                                                // 156
				});                                                                                                        // 156
			} else if (courseId != undefined && courseId != "" && visiblity == 0) {                                     // 157
				//invalidated reviews for a class                                                                          // 157
				console.log('in 2');                                                                                       // 158
				ret = Reviews.find({                                                                                       // 159
					"class": courseId,                                                                                        // 159
					visible: 0                                                                                                // 159
				}, {                                                                                                       // 159
					limit: 700                                                                                                // 160
				});                                                                                                        // 160
			} else if (visiblity == 0) {                                                                                // 161
				//all invalidated reviews                                                                                  // 161
				ret = Reviews.find({                                                                                       // 162
					visible: 0                                                                                                // 162
				}, {                                                                                                       // 162
					limit: 700                                                                                                // 162
				});                                                                                                        // 162
			} else {                                                                                                    // 163
				//no reviews                                                                                               // 163
				//will always be empty because visible is 0 or 1. allows meteor to still send the ready flag when a new publication is sent
				ret = Reviews.find({                                                                                       // 165
					visible: 10                                                                                               // 165
				});                                                                                                        // 165
			}                                                                                                           // 166
                                                                                                               //
			return ret;                                                                                                 // 167
		}                                                                                                            // 168
                                                                                                               //
		return validReviews;                                                                                         // 150
	}()); // COMMENT THESE OUT AFTER THE FIRST METEOR BUILD!!                                                     // 150
	//Classes.remove({});                                                                                         // 171
	//Subjects.remove({});                                                                                        // 172
	//addAllCourses(findAllSemesters());                                                                          // 173
} //Other helper functions used above                                                                          // 174
// Adds all classes and subjects from Cornell's API between the selected semesters to the database.            // 178
// Called when updating for a new semester and when initializing the database                                  // 179
                                                                                                               //
                                                                                                               //
function addAllCourses(semesters) {                                                                            // 180
	// var semesters = ["SP17", "SP16", "SP15","FA17", "FA16", "FA15"];                                           // 181
	for (semester in meteorBabelHelpers.sanitizeForInObject(semesters)) {                                         // 182
		//get all classes in this semester                                                                           // 183
		var result = HTTP.call("GET", "https://classes.cornell.edu/api/2.0/config/subjects.json?roster=" + semesters[semester], {
			timeout: 30000                                                                                              // 184
		});                                                                                                          // 184
                                                                                                               //
		if (result.statusCode != 200) {                                                                              // 185
			console.log("error");                                                                                       // 186
		} else {                                                                                                     // 187
			response = JSON.parse(result.content); //console.log(response);                                             // 188
                                                                                                               //
			var sub = response.data.subjects;                                                                           // 190
                                                                                                               //
			for (course in meteorBabelHelpers.sanitizeForInObject(sub)) {                                               // 191
				parent = sub[course]; //if subject doesn't exist add to Subjects collection                                // 192
                                                                                                               //
				checkSub = Subjects.find({                                                                                 // 194
					'subShort': parent.value.toLowerCase()                                                                    // 194
				}).fetch();                                                                                                // 194
                                                                                                               //
				if (checkSub.length == 0) {                                                                                // 195
					console.log("new subject: " + parent.value);                                                              // 196
					Subjects.insert({                                                                                         // 197
						subShort: parent.value.toLowerCase(),                                                                    // 198
						subFull: parent.descr                                                                                    // 199
					});                                                                                                       // 197
				} //for each subject, get all classes in that subject for this semester                                    // 201
                                                                                                               //
                                                                                                               //
				var result2 = HTTP.call("GET", "https://classes.cornell.edu/api/2.0/search/classes.json?roster=" + semesters[semester] + "&subject=" + parent.value, {
					timeout: 30000                                                                                            // 204
				});                                                                                                        // 204
                                                                                                               //
				if (result2.statusCode != 200) {                                                                           // 205
					console.log("error2");                                                                                    // 206
				} else {                                                                                                   // 207
					response2 = JSON.parse(result2.content);                                                                  // 208
					courses = response2.data.classes; //add each class to the Classes collection if it doesnt exist already   // 209
                                                                                                               //
					for (course in meteorBabelHelpers.sanitizeForInObject(courses)) {                                         // 212
						try {                                                                                                    // 213
							var check = Classes.find({                                                                              // 214
								'classSub': courses[course].subject.toLowerCase(),                                                     // 214
								'classNum': courses[course].catalogNbr                                                                 // 214
							}).fetch();                                                                                             // 214
                                                                                                               //
							if (check.length == 0) {                                                                                // 215
								console.log("new class: " + courses[course].subject + " " + courses[course].catalogNbr + "," + semesters[semester]); //insert new class with empty prereqs and reviews
                                                                                                               //
								Classes.insert({                                                                                       // 218
									classSub: courses[course].subject.toLowerCase(),                                                      // 219
									classNum: courses[course].catalogNbr,                                                                 // 220
									classTitle: courses[course].titleLong,                                                                // 221
									classPrereq: [],                                                                                      // 222
									classFull: courses[course].subject.toLowerCase() + " " + courses[course].catalogNbr + " " + courses[course].titleLong.toLowerCase(),
									classSems: [semesters[semester]]                                                                      // 224
								});                                                                                                    // 218
							} else {                                                                                                // 226
								var matchedCourse = check[0]; //only 1 should exist                                                    // 227
                                                                                                               //
								var oldSems = matchedCourse.classSems;                                                                 // 228
                                                                                                               //
								if (oldSems.indexOf(semesters[semester]) == -1) {                                                      // 229
									console.log("update class " + courses[course].subject + " " + courses[course].catalogNbr + "," + semesters[semester]);
									oldSems.push(semesters[semester]); //add this semester to the list                                    // 231
                                                                                                               //
									Classes.update({                                                                                      // 232
										_id: matchedCourse._id                                                                               // 232
									}, {                                                                                                  // 232
										$set: {                                                                                              // 232
											classSems: oldSems                                                                                  // 232
										}                                                                                                    // 232
									});                                                                                                   // 232
								}                                                                                                      // 233
							}                                                                                                       // 234
						} catch (error) {                                                                                        // 235
							console.log(course);                                                                                    // 236
						}                                                                                                        // 237
					}                                                                                                         // 238
				}                                                                                                          // 239
			}                                                                                                           // 240
		}                                                                                                            // 241
	}                                                                                                             // 242
} //returns an array of the current semester, to be given to the addAllCourses function                        // 243
                                                                                                               //
                                                                                                               //
function findCurrSemester() {                                                                                  // 246
	var response = HTTP.call("GET", "https://classes.cornell.edu/api/2.0/config/rosters.json", {                  // 247
		timeout: 30000                                                                                               // 247
	});                                                                                                           // 247
                                                                                                               //
	if (response.statusCode != 200) {                                                                             // 248
		console.log("error");                                                                                        // 249
	} else {                                                                                                      // 250
		response = JSON.parse(response.content);                                                                     // 251
		allSemesters = response.data.rosters;                                                                        // 252
		thisSem = allSemesters[allSemesters.length - 1].slug;                                                        // 253
		return [thisSem];                                                                                            // 254
	}                                                                                                             // 255
} //returns an array of all current semesters, to be given to the addAllCourses function                       // 256
                                                                                                               //
                                                                                                               //
function findAllSemesters() {                                                                                  // 259
	var response = HTTP.call("GET", "https://classes.cornell.edu/api/2.0/config/rosters.json", {                  // 260
		timeout: 30000                                                                                               // 260
	});                                                                                                           // 260
                                                                                                               //
	if (response.statusCode != 200) {                                                                             // 261
		console.log("error");                                                                                        // 262
	} else {                                                                                                      // 263
		response = JSON.parse(response.content);                                                                     // 264
		allSemesters = response.data.rosters;                                                                        // 265
		var allSemestersArray = allSemesters.map(function (semesterObject) {                                         // 266
			return semesterObject.slug;                                                                                 // 267
		});                                                                                                          // 268
		console.log(allSemestersArray);                                                                              // 269
		return allSemestersArray;                                                                                    // 270
	}                                                                                                             // 271
}                                                                                                              // 272
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}}},"server":{"main.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                             //
// server/main.js                                                                                              //
//                                                                                                             //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                               //
var Meteor = void 0;                                                                                           // 1
module.watch(require("meteor/meteor"), {                                                                       // 1
  Meteor: function (v) {                                                                                       // 1
    Meteor = v;                                                                                                // 1
  }                                                                                                            // 1
}, 0);                                                                                                         // 1
module.watch(require("../imports/api/classes.js"));                                                            // 1
Meteor.startup(function () {// code to run on server at startup                                                // 4
});                                                                                                            // 6
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}}},{
  "extensions": [
    ".js",
    ".json",
    ".jsx"
  ]
});
require("./server/main.js");
//# sourceMappingURL=app.js.map
