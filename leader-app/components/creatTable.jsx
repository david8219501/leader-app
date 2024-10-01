import { StyleSheet } from 'react-native';
import moment from 'moment';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

const hebrewDays = [
  'ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי',
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
        shiftsByDay[dateKey][shiftKey].push(`${firstName} ${lastName.charAt(0)}.`);
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

  // Generate PDF file
  const { uri } = await Print.printToFileAsync({
    html: htmlContent,
    orientation: 'landscape',
  });

  // Share the PDF file
  await Sharing.shareAsync(uri);
};

const generateHTML = (pdfContent, weekDates) => {
  const morningRows = pdfContent.map(item => `<td>${item.morning.join('<br>')}</td>`).join('');
  const hasAfternoonData = pdfContent.some(item => item.afternoon.length > 0);
  const afternoonRows = hasAfternoonData
    ? pdfContent.map(item => `<td>${item.afternoon.join('<br>')}</td>`).join('')
    : pdfContent.map(() => `<td></td>`).join('');
  const eveningRows = pdfContent.map(item => `<td>${item.evening.join('<br>')}</td>`).join('');

  return `
    <html>
      <head>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            direction: rtl; 
            margin: 0; 
            padding: '100px'; 
            height: auto; 
            display: flex; 
            flex-direction: column; 
            justify-content: center; 
            align-items: center; 
            overflow: auto; 
            background: linear-gradient(to bottom, #e3f3f4, #cddcee);
          }
          table { 
            width: 95%;
            border-collapse: collapse; 
            background-color: rgba(255, 255, 255, 0.8); 
            border-radius: 10px; 
            overflow: hidden; 
            margin: 20px 0; /* הוסף רווח עליון ותחתון */
          }
          h1 {
            margin-bottom: 40px; 
            color: #2e6eb7; 
            text-align: center; 
            font-size: 50px; 
            text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.7); 
            margin: 20px; 
          }
          th, td { 
            border: 1px solid black; 
            text-align: center; 
            font-size: 18px; /* הקטנת גודל הטקסט */
            font-weight: bold;
            padding: 15px; /* צמצום ה-padding */
          }
          th { 
            background-color: #4f81bb; 
            color: white; 
          }
          .shift-header { 
            background-color: #ffffff; 
            color: #000000; 
          }
          .header-image {
            background-image: url('https://did.li/qS75q'); 
            background-size: contain; 
            background-repeat: no-repeat; 
            height: 60px; 
            text-align: center; 
            display: flex; 
            align-items: center; 
            justify-content: center; 
            background-color: transparent; 
          }
          .title-image {
            max-height: 50%; 
            max-width: 50%; 
            margin-bottom: 30px; 
          }
        </style>
      </head>
      <body>
        <img src="https://leaderkids.co.il/wp-content/uploads/2022/09/leaderLogo.svg" alt="לוגו לידר" class="title-image" />
        <table>
          <tr>
            <th class="header-image"></th>
            ${weekDates.map(day => `<th>${day.day}<br>${day.date}</th>`).join('')}
          </tr>
          <tr class="shift-header">
            <th>בוקר</th>
            ${morningRows}
          </tr>
          ${hasAfternoonData ? `<tr class="shift-header"><th>צהריים</th>${afternoonRows}</tr>` : ''}
          <tr class="shift-header">
            <th>ערב</th>
            ${eveningRows}
          </tr>
        </table>
      </body>
    </html>
  `;
};



const styles = StyleSheet.create({});

export default generatePDF;
