// categories is the main data structure for the app; it looks like this:

//  [
//    { title: "Math",
//      clues: [
//        {question: "2+2", answer: 4, showing: null},
//        {question: "1+1", answer: 2, showing: null}
//        ...
//      ],
//    },
//    { title: "Literature",
//      clues: [
//        {question: "Hamlet Author", answer: "Shakespeare", showing: null},
//        {question: "Bell Jar Author", answer: "Plath", showing: null},
//        ...
//      ],
//    },
//    ...
//  ]

let finalCategories = [];

/** Get NUM_CATEGORIES random category from API.
 *
 * Returns array of category ids
 */

async function getCategoryIds() {
	let categoryList = [];
	const data = await axios.get('http://jservice.io/api/categories?count=100');
	for (cells of data.data) {
		categoryList.push(cells.id);
	}
	for (let i = 0; i < 6; i++) {
		finalCategories.push(_.sample(categoryList));
	}
	return finalCategories;
}

/** Return object with data about a category:
 *
 *  Returns { title: "Math", clues: clue-array }
 *
 * Where clue-array is:
 *   [
 *      {question: "Hamlet Author", answer: "Shakespeare", showing: null},
 *      {question: "Bell Jar Author", answer: "Plath", showing: null},
 *      ...
 *   ]
 */

async function getCategory(catId) {
	let category = await axios.get(`http://jservice.io/api/category?id=${catId}`);
	return await category.data;
}

/** Fill the HTML table#jeopardy with the categories & cells for questions.
 *
 * - The <thead> should be filled w/a <tr>, and a <td> for each category
 * - The <tbody> should be filled w/NUM_QUESTIONS_PER_CAT <tr>s,
 *   each with a question for each category in a <td>
 *   (initally, just show a "?" where the question/answer would go.)
 */

async function fillTable() {
	$('table').toggleClass('hidden').append('<thead>');

	for (let i = 0; i < 6; i++) {
		const data = await getCategory(finalCategories[i]);
		const newTh = $('<th>').text(_.startCase(await data.title));

		$('thead').append(await newTh);
	}

	$('table').append('<tbody>');

	for (let i = 0; i < 5; i++) {
		const row = $('<tr>');
		for (let j = 0; j < 6; j++) {
			const cell = $('<td>').text('?');
			row.append(cell);
		}
		$('tbody').append(row);
	}
	hideLoadingView();
}

/** Handle clicking on a clue: show the question or answer.
 *
 * Uses .showing property on clue to determine what to show:
 * - if currently null, show question & set .showing to "question"
 * - if currently "question", show answer & set .showing to "answer"
 * - if currently "answer", ignore click
 * */

async function handleClick(evt) {
	const cell = $(this);
	const column = cell.index();

	if (!cell.attr('showing')) {
		const data = await getCategory(finalCategories[column]);
		const randomQuestion = _.sample(data.clues);
		console.log(randomQuestion);
		cell.text(randomQuestion.question);
		cell.attr('showing', 'question');
		cell.attr('answer', randomQuestion.answer);
	} else if (cell.attr('showing') === 'question') {
		cell.text(cell.attr('answer'));
		cell.attr('showing', 'answer');
	} else if (cell.showing === 'answer') {
	}
}

/** Wipe the current Jeopardy board, show the loading spinner,
 * and update the button used to fetch data.
 */

function showLoadingView() {
	$('button').text('Loading...');
	$('#spinner').toggleClass('spinner');
}

/** Remove the loading spinner and update the button used to fetch data. */

function hideLoadingView() {
	$('button').text('Restart!');
	$('table').toggleClass('hidden');
	$('#spinner').toggleClass('spinner');
}

/** Start game:
 *
 * - get random category Ids
 * - get data for each category
 * - create HTML table
 * */

async function setupAndStart() {
	$('table').empty();
	showLoadingView();
	await getCategoryIds();
	await fillTable();
}

/** On click of start / restart button, set up game. */

$('button').on('click', setupAndStart);

/** On page load, add event handler for clicking clues */

$(function () {
	$('#jeopardy').on('click', 'td', handleClick);
});
