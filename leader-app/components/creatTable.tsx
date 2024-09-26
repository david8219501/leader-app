import { StyleSheet } from 'react-native';
import moment from 'moment';
import * as Print from 'expo-print';

const hebrewDays = [
  'ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת',
];

const generatePDF = async (startDate, employeeShifts) => {
  const start = moment(startDate, 'DD/MM/YY');
  
  // Generate week dates
  const weekDates = Array.from({ length: 6 }, (_, i) => {
    const date = start.clone().add(i, 'days');
    return {
      day: hebrewDays[i],
      date: date.format('DD/MM/YY'),
      dateString: date.format('DD/MM/YY'),
    };
  });

  const shiftsByDay = weekDates.reduce((acc, day) => {
    acc[day.dateString] = { בוקר: [], צהריים: [], ערב: [] };
    return acc;
  }, {});

  // Populate shifts
  employeeShifts.forEach(([id, firstName, lastName, shift, date]) => {
    const dateKey = moment(date, 'DD/MM/YY').format('DD/MM/YY');
    if (shiftsByDay[dateKey]) {
      const shiftKey = shift;
      if (shiftsByDay[dateKey][shiftKey] !== undefined) {
        shiftsByDay[dateKey][shiftKey].push(`${firstName} ${lastName}`);
      } else {
        console.error(`Invalid shift type: ${shiftKey} for date: ${dateKey}`);
      }
    } else {
      console.error(`Date key not found: ${dateKey}`);
    }
  });

  const pdfContent = weekDates.map(day => {
    const dateKey = day.dateString;
    return {
      day: day.day,
      date: day.date,
      morning: shiftsByDay[dateKey]["בוקר"] || [""],
      afternoon: shiftsByDay[dateKey]["צהריים"] || [""],
      evening: shiftsByDay[dateKey]["ערב"] || [""],
    };
  });

  const htmlContent = generateHTML(pdfContent, weekDates);

  await Print.printAsync({
    html: htmlContent,
  });
};

const generateHTML = (pdfContent, weekDates) => `
    <html>
      <head>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            direction: rtl; 
            margin: 0; /* ביטול רווחים סביב הדף */
            height: 100vh; /* גובה הדף */
            display: flex; /* שימוש ב-Flexbox */
            flex-direction: column; /* הכוונה עמודה */
            justify-content: center; /* מרכז את התוכן אנכית */
            align-items: center; /* מרכז את התוכן אופקית */
            overflow: hidden; /* להסתיר גלילה */
            background: linear-gradient(to bottom, #e3f3f4, #cddcee); /* גרדיאנט מלבן לכחול */
          }
          table { 
            width: 97%; 
            max-width: 97%; /* הגבל את רוחב הטבלה */
            min-height:80%
            border-collapse: collapse; 
            background-color: rgba(255, 255, 255, 0.8); /* צבע רקע שקוף כדי שהתמונה תראה דרך */
            border-radius: 10px; /* רדיוס לפינות */
          }
          h1 {
            margin-bottom: 40px; /* Space between title and table */
            color: #2e6eb7; /* Change the title color for better visibility */
            text-align: center; /* Center the title */
            font-size: 50px; /* Adjust font size as needed */
            text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.7); /* Add shadow for better visibility */
          }
          th, td { 
            border: 1px solid black; 
            padding: 8px; 
            padding-top: 30px;
            padding-bottom: 30px;
            text-align: center; 
            font-size: 20px; /* Adjust font size as needed */
            font-weight: bold;
          }
          th { 
            background-color: #2e6eb7; 
            color: white; 
          }
          .shift-header { 
            background-color: #ffffff; 
            color: #000000; 
          }
          .header-image {
            background-image: url('https://did.li/qS75q'); 
            background-size: contain; /* שינוי כאן לשמור על יחס גובה-רוחב */
            background-repeat: no-repeat; /* לא לחזור על התמונה */
            height: 60px; /* הגדלת גובה התמונה */
            text-align: center; /* ממרכז את הטקסט */
            display: flex; /* שימוש ב-Flexbox למרכז את התוכן */
            align-items: center; /* מרכז אנכית */
            justify-content: center; /* מרכז אופקית */
            background-color: transparent; /* שים את הרקע לשקוף */
          }
          .title-image {

            max-height: 50%; /* Adjust as needed */
            max-width: 50%; /* Adjust as needed */
          }
        </style>
      </head>
      <body>
        <img src="https://leaderkids.co.il/wp-content/uploads/2022/09/leaderLogo.svg" alt="לוגו לידר" class="title-image" />
        <h1>קריית אתא</h1>
        <table>
          <tr>
            <th class="header-image"></th> <!-- תא ריק עם תמונה כרקע -->
            ${weekDates.map(day => `<th>${day.day}<br>${day.date}</th>`).join('')}
          </tr>
          <tr class="shift-header">
            <th>בוקר</th>
            ${pdfContent.map(item => `<td>${item.morning.join('<br>')}</td>`).join('')}
          </tr>
          <tr class="shift-header">
            <th>צהריים</th>
            ${pdfContent.map(item => `<td>${item.afternoon.join('<br>')}</td>`).join('')}
          </tr>
          <tr class="shift-header">
            <th>ערב</th>
            ${pdfContent.map(item => `<td>${item.evening.join('<br>')}</td>`).join('')}
          </tr>
        </table>
      </body>
    </html>
`;


const styles = StyleSheet.create({});

export default generatePDF;
