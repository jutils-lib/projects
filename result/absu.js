
$('#print').on('click', function () {
$.dialog({
 content: () => {
  return `
  <div id="print-dialog">
   <div id="close-button">❌</div>
   <div id="print-content">
    <div>File name</div>
    <input type="text">
    <button>Print</button>
   </div>
  </div>
  ` 
 },
 render: (root, controls) => {
  const input = $(root.find('input'));
  const now = Date.now();
  
  // Set a unique default filename for the PDF.
  input.prop('placeholder', `result.${now}.pdf`);
  
  // Close the dialog without initiating the print operation.
  root.find('#close-button').onclick = () => {
  controls.resolve();
  }
  
  root.find('button').onclick = () => {   
  const title = document.title;  
   
  // Temporarily use the input value as the document's print filename.
  document.title = input.val().trim() !== '' ? input.val() : input.prop('placeholder');
  
  controls.resolve();
 
  window.print();   
  
  // Restore the original document title after printing.   
  document.title = title;       
  }  
 },
 parseHTML: true,
 styles: {
  dialog: {
   bottom: 0,
   width: '100%',
   borderRadius: '20px 20px 0 0'
  }
 }
});
});


// Toggle action controls when the user double-clicks near the bottom of the viewport.
$(document).on('dblclick', (e) => {
// Ignore double-clicks outside the top 10% and left 20% of the viewport.
if(e.clientY > window.innerHeight * 0.1 || e.clientX > window.innerWidth * 0.2) return;

const element = $('#actions');

// Toggle visibility while preserving the intended flex layout.
if(element.css('display') === 'flex') {
element.css('display', 'none');
} else {
element.css('display', 'flex');    
}
});



// Append a new empty course result row to the table.
$('#add-item').on('click', () => {
$('<tr>').html(`
 <td></td>
 <td></td>      
 <td></td> 
 <td class="test-score"></td>
 <td class="exam-score"></td>
 <td class="total"></td>
 <td class="grade"></td>
 <td>N/A</td>      
`).appendTo('#course-results > table');  
});



// Toggle editing mode and control available actions.
$('#edit-save').on('click', function (e) {
const actionButtons  = $('#add-item, #print, #delete-item');

const isEditing = $(e.target).text() === '✏️';

actionButtons.prop('disabled', isEditing);
$(e.target).text(isEditing ? '💾' : '✏️');

$('td').each(el => $(el).attr('contenteditable', isEditing));

if(!isEditing) calculateResults();
});



// Calculate student scores and assign corresponding grades.
function calculateResults() {
$('#course-results tr:nth-child(n+2)').each(el => {
const test = $(el).child(3);
const testScore = $.toNumber(test.text());

const exam = $(el).child(4);
const examScore = $.toNumber(exam.text());

const total = $(el).child(5);
const grade = $(el).child(6);

test.text(testScore > 0 ? $.toFixed(testScore, 2) : 0);
exam.text(examScore > 0 ? $.toFixed(examScore, 2) : 0);

let mark = 'A';
let result = testScore + examScore;
if(isNaN(result)) result = 0;

if($('#actions input').is(':checked')) {
const decimalPlaces = result > 0 ? 2 : 0;
total.text($.toFixed(result, decimalPlaces));

if(result >= 0 && result <= 39) mark = 'F';
if(result >= 40 && result <= 44) mark = 'E';
if(result >= 45 && result <= 49) mark = 'D';
if(result >= 50 && result <= 59) mark = 'C';
if(result >= 60 && result <= 69) mark = 'B';

grade.text(mark);
}
});   
}



let rowCount = 0;

// Toggle delete mode and enable row selection for removal.
$('#delete-item').on('click', (e) => {

rowCount = rowCount || $('#course-results tr:nth-child(n+2)').length;

// Skip deletion mode when there are no rows to remove.
if(rowCount === 0) return;

const actionButtons  = $('#add-item, #print, #edit-save');

const isDeleteMode = $(e.target).text() === '🗑️'; 

actionButtons.prop('disabled', isDeleteMode);
$(e.target).text(isDeleteMode ? '💾' : '🗑️');

$('#course-results tr:nth-child(n+2)').on('click', (e) => e.currentTarget.remove());

if(!isDeleteMode) {
$('#course-results tr:nth-child(n+2)').off();
rowCount = 0;
}
});



// Enable pointer-based dragging while preserving the initial grab position.
function draggable(element) {
let offsetX, offsetY;

$(element).on('pointerdown', (e) => {
const rect = e.currentTarget.getBoundingClientRect();
offsetX = e.clientX - rect.left;
offsetY = e.clientY - rect.top;    
});


$(element).on('pointermove', (e) => {  
const x = e.clientX - offsetX;
const y = e.clientY - offsetY;

$(element).css({
 position: 'fixed',    
 top: y + 'px',
 left: x + 'px',
});
});
}

draggable('#content-header');
draggable('.user-logo');