var express = require("express");
var mysql2 = require("mysql2");
var fileLoader = require("express-fileupload");
var nodemailer = require("nodemailer");

let app = express();
app.use(express.static("public"));
app.use(fileLoader());
app.use(express.urlencoded("true"));

// let config = {
//     host: "127.0.0.1",
//     user: "root",
//     password: "rajneesh@358",
//     database: "project",
//     dateStrings: true
// }

let config = {
         host: "bojtw1szjfkxgym5nwpe-mysql.services.clever-cloud.com",
         user: "upqqezcgzcukta1c",
         password: "Ya8O5XRFZ9obmgJmCwKU",
         database: "bojtw1szjfkxgym5nwpe",
         dateStrings: true,
         keepAliveInitialDelay:10000,
         enableKeepAlive :true
    }


var mysql = mysql2.createConnection(config);

app.listen(2024, function (request, response) {
    console.log("Server Started!");
})

mysql.connect(function (err) {
    if (err == null) {
        console.log("Connected to database!");
    }
    else
        console.log(err.message);
})

app.get("/", function (request, response) {

    let path = __dirname + "/public/index.html";
    response.sendFile(path);
})

app.get("/signup-process", function (request, response) {

    let email = request.query.txtEmail;
    let pwd = request.query.txtPwd;
    let utype = request.query.Combo;

    mysql.query("insert into users values(?,?,?,?)", [email, pwd, utype, 1], function (err) {
        if (err == null) {

            console.log(request.query);
            response.send("Signup Done!")
        }
        else
            response.send(err.message);
    })
})

app.get("/login-process", function (request, response) {
    let emaiil = request.query.txtEmaiil;
    let pwwd = request.query.txtPwwd;

    mysql.query("select * from users where email=? and pwd=?", [emaiil, pwwd], function (err, result) {

        console.log(request.query);
        if (err != null) {
            response.send(err.message);
            return;
        }
        if (result.length == 0) {
            response.send("Email doesnot exist or Invalid password");
            return;
        }
        if (result[0].status == 1) {
            response.send(result[0].utype);
            return;
        }
        else {
            response.send("Blocked!");
            return;
        }

    })

})

app.get("/infl-dash", function (request, response) {

    let path = __dirname + "/public/infl-dash.html";
    response.sendFile(path);
    console.log("dashboard opened");
})

app.get("/admin-dash", function (request, response) {

    let path = __dirname + "/public/admin-dash.html";
    response.sendFile(path);
    console.log("admin-dashboard opened");
})

app.get("/infl-profile", function (request, response) {

    let path = __dirname + "/public/infl-profile.html";
    response.sendFile(path);
    console.log("profile opened");
})

app.post("/save-profile", function (request, response) {

    console.log(request.files);
    let fileName = "";
    if (request.files != null) {
        fileName = request.files.ppic.name;
        let path = __dirname + "/public/uploads/" + fileName;
        request.files.ppic.mv(path);
    }
    else {
        fileName = "nopic.jpg";
    }
    console.log(fileName);


    mysql.query("insert into iprofile values(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)", [request.body.txtEmail, request.body.txtFname, request.body.txtLname, request.body.gender, request.body.txtAdd, request.body.txtState, request.body.txtCity, request.body.txtZip, request.body.content.toString(), request.body.txtInsta, request.body.txtFb, request.body.txtX, request.body.txtSc, request.body.txtContact, request.body.txtOther, fileName, request.body.dob], function (err) {

        if (err == null)
            response.redirect("save-result.html");
        else
            response.send(err.message);
    })
})

app.get("/search-profile", function (request, response) {
    let emailid = request.query.txtEmail;


    mysql.query("select * from iprofile where email=?", [emailid], function (err, resultJsonAry) {
        if (err != null) {
            response.send(err.message);
            return;
        }
        response.send(resultJsonAry);
        console.log(resultJsonAry);

    })

})

app.post("/update-profile", function (request, response) {

    // console.log(request.body);
    let fileName = "";

    if (request.files != null) {

        fileName = request.files.ppic.name;
        let path = __dirname + "/public/uploads/" + fileName;
        request.files.ppic.mv(path);
    }

    else {
        fileName = request.body.hdn;
    }

    mysql.query("update iprofile set firstname=?,lastname=?,gender=?,address=?,state=?,city=?,zip=?,content=?,insta=?,fb=?,X=?,snapchat=?,contact=?,other=?,picpath=?,dob=?  where email=?", [request.body.txtFname, request.body.txtLname, request.body.gender, request.body.txtAdd, request.body.txtState, request.body.txtCity, request.body.txtZip, request.body.content.toString(), request.body.txtInsta, request.body.txtFb, request.body.txtX, request.body.txtSc, request.body.txtContact, request.body.txtOther, fileName, request.body.dob, request.body.txtEmail], function (err, result) {

        if (err == null) {
            if (result.affectedRows >= 1)
                response.redirect("update-result.html");
            else
                response.send("Invalid Email");
        }

        else
            response.send(err.message);
    })
})

app.get("/save-bookings", function (request, response) {
    let emailid = request.query.txtEmail;
    let event = request.query.txtEvent;
    let city = request.query.txtCity;
    let venue = request.query.txtVenue;
    let date = request.query.txtDate;
    let time = request.query.txtTime;

    mysql.query("insert into events values(null,?,?,?,?,?,?)", [emailid, event, city, venue, date, time], function (err) {

        if (err == null)
            response.send("Event Booked !");
        else
            response.send(err.message);
    })
})

app.get("/change-password", function (request, response) {
    let chemail = request.query.chemail;
    let opwd = request.query.opwd;
    let npwd = request.query.npwd;
    let nnpwd = request.query.nnpwd;

    if (npwd != nnpwd) {
        response.send("passwords do not match");
        return;
    }

    mysql.query("select * from users where email=? and pwd=?", [chemail, opwd], function (err, resultJsonAry) {
        if (err != null) {
            response.send(err.message);
            return;
        }

        if (resultJsonAry.length == 0) {
            response.send("Incorrect Email or Password!");
            return;
        }

        mysql.query("update users set pwd=? where email=?", [npwd, chemail]);
        response.send("Password Changed!");

    })
})

app.get("/admin-users", function (request, response) {

    let path = __dirname + "/public/admin-users.html";
    response.sendFile(path);
    console.log("opened");
})

app.get("/fetch-all", function (req, resp) {
    mysql.query("select * from users", function (err, resultJsonAry) {
        if (err != null) {
            resp.send(err.message);
            return;

        }
        resp.send(resultJsonAry);
    })

})

app.get("/admin-all-influ", function (request, response) {

    let path = __dirname + "/public/admin-all-influ.html";
    response.sendFile(path);
    console.log("opened");
})

app.get("/fetch-profile", function (request, response) {
    mysql.query("select * from iprofile", function (err, resultJsonAry) {
        if (err != null) {
            response.send(err.message);
            return;
        }
        response.send(resultJsonAry);
    })

})

app.get("/delete-one", function (req, resp) {
    mysql.query("delete from users where email=?", [req.query.email], function (err, resultJsonAry) {
        if (err != null) {
            resp.send(err.message);
            return;
        }
        resp.send("Deleted!");

    })

})

app.get("/resume-user", function (request, response) {
    let status = 1;
    mysql.query("update users set status=? where email=?", [status, request.query.email], function (err, resultJsonAry) {
        if (err != null) {
            response.send(err.message);
            return;
        }
        response.send("Resumed!");

    })

})

app.get("/block-user", function (request, response) {
    let status = 0;
    mysql.query("update users set status=? where email=?", [status, request.query.email], function (err, resultJsonAry) {
        if (err != null) {
            response.send(err.message);
            return;
        }
        response.send("Blocked!");

    })

})

app.get("/influ-finder", function (request, response) {

    let path = __dirname + "/public/influ-finder.html";
    response.sendFile(path);
    console.log("opened");
})

app.get("/fetch-city", function (request, response) {

    let content = "%" + request.query.content + "%";
    mysql.query("select distinct city from iprofile where content like ?", [content], function (err, resultJsonAry) {
        if (err != null) {
            response.send(err.message);
            return;
        }
        response.send(resultJsonAry);
    })

})

app.get("/show-cards", function (request, response) {

    let city = request.query.city;
    let content = "%" + request.query.content + "%";
    mysql.query("select * from iprofile where city like ? && content like ?", [city, content], function (err, resultJsonAry) {
        if (err != null) {
            response.send(err.message);
            return;
        }
        response.send(resultJsonAry);
    })

})

app.get("/show-name", function (request, response) {

    let name = request.query.name;

    mysql.query("select * from iprofile where firstname=?", [name], function (err, resultJsonAry) {
        if (err != null) {
            response.send(err.message);
            return;

        }
        response.send(resultJsonAry);

    })

})

app.get("/event-manager", function (request, response) {

    let path = __dirname + "/public/events-manager.html";
    response.sendFile(path);
    console.log("opened");
})

app.get("/fetch-events", function (request, response) {

    let email = request.query.email;
    mysql.query("select * from events where email=? && doe>=current_date()", [email], function (err, resultJsonAry) {
        if (err != null) {
            response.send(err.message);
            return;
        }
        response.send(resultJsonAry);
    })

})

app.get("/delete-event", function (request, response) {
    mysql.query("delete from events where rid=?", [request.query.record], function (err, resultJsonAry) {
        if (err != null) {
            response.send(err.message);
            return;
        }
        response.send("Deleted!");

    })

})

app.post("/save-client-profile", function (request, response) {
    console.log(request.body);

    mysql.query("insert into cprofile values(?,?,?,?,?,?)", [request.body.txtEmail, request.body.txtName, request.body.txtState, request.body.txtCity, request.body.Combo.toString(), request.body.txtContact], function (err) {

        if (err == null)
            response.redirect("save-result.html");
        else
            response.send(err.message);
    })
})

app.get("/search-client-profile", function (request, response) {
    let emailid = request.query.txtEmail;


    mysql.query("select * from cprofile where email=?", [emailid], function (err, resultJsonAry) {
        if (err != null) {
            response.send(err.message);
            return;
        }
        response.send(resultJsonAry);
        console.log(resultJsonAry);

    })

})

app.post("/modify-client-profile", function (request, response) {

    mysql.query("update cprofile set flname=?,state=?,city=?,org=?,contact=? where email=?", [request.body.txtName, request.body.txtState, request.body.txtCity, request.body.Combo.toString(), request.body.txtContact, request.body.txtEmail], function (err, result) {

        if (err == null) {
            if (result.affectedRows >= 1)
                response.redirect("update-result.html");
            else
                response.send("Invalid Email");
        }

        else
            response.send(err.message);
    })
})

app.get("/client-profile", function (request, response) {

    let path = __dirname + "/public/client-profile.html";
    response.sendFile(path);
    console.log("profile opened");
})

app.get("/forget-password", function (request, response) {
    // console.log(request.query);
    let influmail = request.query.txtEmaiil;
    if (influmail == "") {
        response.send("Enter Email");
        return;
    }

    mysql.query("select pwd from users where email=?", [influmail], function (err, result) {

        //console.log(request.query);
        if (err != null) {
            response.send(err.message);
            return;
        }
        if (result.length == 0) {
            response.send("Email doesnot exist");
            return;
        }
        var transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: "angelina12gupta@gmail.com",
                pass: "udcz abbv nwui nuza"
            }
        });

        var receiver = {

            from: "angelina12gupta@gmail.com",
            to: influmail,
            subject: "Password Recovery",
            text: "Your old password is:" + result[0].pwd,
        }

        transporter.sendMail(receiver, function (err, result) {
            if (err != null)
                response.send(err);
            else
                response.send("Email Sent!");

        });

    })

})

app.get("/collaboration-mail", function (request, response) {
    // console.log(request.query);

    let influencermail = request.query.email;
    let collaboratormail = request.query.active;
    if (influencermail == "") {
        response.send("Enter Email");
        return;
    }

    mysql.query("select * from users where email=?", [influencermail], function (err, result) {

        console.log(result);
        if (err != null) {
            response.send(err.message);
            return;
        }
        var transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: "angelina12gupta@gmail.com",
                pass: "udcz abbv nwui nuza"
            }
        });

        var receiver = {

            from: collaboratormail,
            to: influencermail,
            subject: "Connect with Connectopia!",
            text: "Warm Greetings! I/We want to collaborate with you. If you are interested, please revert at this email",
        }

        transporter.sendMail(receiver, function (err, result) {
            if (err != null)
                response.send(err);
            else
                response.send(result);

        });

    })

})