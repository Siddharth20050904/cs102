const hbs = require('nodemailer-express-handlebars');
const nodemailer = require('nodemailer');
const path = require('path');
const { title } = require('process');


exports.sendEmails = async function(students,e) {
    // initialize nodemailer
    var transporter = nodemailer.createTransport(
        {
            service: 'gmail',
            auth:{
                user: 'replyn418@gmail.com',
                pass: 'mmzh hfjn orxj voeq'
            }
        }
    );

    // point to the template folder
    const handlebarOptions = {
        viewEngine: {
            partialsDir: path.resolve('./views/'),
            defaultLayout: false,
        },
        viewPath: path.resolve('./views/'),
    };

    // use a template file with nodemailer
    transporter.use('compile', hbs(handlebarOptions));

    for (const user of students) {
        if (user.email) {
          const mailOptions = {
            from: '"IIT Goa Calendar" <my@company.com>', // sender address
            template: "mail", // the name of the template file, i.e., email.handlebars
            to: user.email,
            subject: `Updated Event :${e.eventTitle}`,
            context: {
              name:user.name,
              faculty: e.faculty_name,
              title:e.eventTitle,
              date:e.date,
              month:e.month,
              year:e.year,
              description:e.eventDescription
            },
          };
          try {
            await transporter.sendMail(mailOptions);
          } catch (error) {
            console.log(`Nodemailer error sending email to ${user.email}`, error);
          }
        }
      }
}