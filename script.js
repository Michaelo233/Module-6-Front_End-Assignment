/**
 * Initializes the Trivia Game when the DOM is fully loaded.
 */
document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("trivia-form");
    const questionContainer = document.getElementById("question-container");
    const newPlayerButton = document.getElementById("new-player");
    const usernameInput = document.getElementById("username");
    // Initialize the game
    checkUsername();
    fetchQuestions();
    displayScores();

    // Store Session
    function storePlayerName(name) {
        sessionStorage.setItem("username", name);
    }

    // Retrieve stored session from session storage
    function getPlayerName() {
        return sessionStorage.getItem("username");
    } 

    // User session check
    function checkUsername() {
        const username = getPlayerName();

        if(username) {
            newPlayerButton.classList.remove("hidden");
        } else {
            newPlayerButton.classList.add("hidden");
        }
    }

    /**
     * Fetches trivia questions from the API and displays them.
     */
    function fetchQuestions() {
        showLoading(true); // Show loading state

        fetch("https://opentdb.com/api.php?amount=10&type=multiple")
            .then((response) => response.json())
            .then((data) => {
                displayQuestions(data.results);
                showLoading(false); // Hide loading state
            })
            .catch((error) => {
                console.error("Error fetching questions:", error);
                showLoading(false); // Hide loading state on error
            });
    }

    /**
     * Toggles the display of the loading state and question container.
     *
     * @param {boolean} isLoading - Indicates whether the loading state should be shown.
     */
    function showLoading(isLoading) {
        document.getElementById("loading-container").classList = isLoading
            ? ""
            : "hidden";
        document.getElementById("question-container").classList = isLoading
            ? "hidden"
            : "";
    }

    /**
     * Displays fetched trivia questions.
     * @param {Object[]} questions - Array of trivia questions.
     */
    function displayQuestions(questions) {
        questionContainer.innerHTML = ""; // Clear existing questions
        questions.forEach((question, index) => {
            const questionDiv = document.createElement("div");
            questionDiv.innerHTML = `
                <p>${question.question}</p>
                ${createAnswerOptions(
                    question.correct_answer,
                    question.incorrect_answers,
                    index
                )}
            `;
            questionContainer.appendChild(questionDiv);
        });
    }

    /**
     * Creates HTML for answer options.
     * @param {string} correctAnswer - The correct answer for the question.
     * @param {string[]} incorrectAnswers - Array of incorrect answers.
     * @param {number} questionIndex - The index of the current question.
     * @returns {string} HTML string of answer options.
     */
    function createAnswerOptions(
        correctAnswer,
        incorrectAnswers,
        questionIndex
    ) {
        const allAnswers = [correctAnswer, ...incorrectAnswers].sort(
            () => Math.random() - 0.5
        );
        return allAnswers
            .map(
                (answer) => `
            <label>
                <input type="radio" name="answer${questionIndex}" value="${answer}" ${
                    answer === correctAnswer ? 'data-correct="true"' : ""
                }>
                ${answer}
            </label>
        `
            )
            .join("");
    }

    // Event listeners for form submission and new player button
    form.addEventListener("submit", handleFormSubmit);
    newPlayerButton.addEventListener("click", newPlayer);

    /**
     * Handles the trivia form submission.
     * @param {Event} event - The submit event.
     */
    function handleFormSubmit(event) {
        event.preventDefault();
        //... form submission logic including setting cookies and calculating score

        let username = getPlayerName();
        if (!username) {
            const playerInput = usernameInput.value.trim();
            if (playerInput === "") return;
            username = playerInput;
            storePlayerName(username);
        }

        // Score Calculation
        const score = scoreCalculator();

        // Save score
        savePlayerScore(username, score);
        // display score
        displayScores();
        // new questions
        fetchQuestions();

        checkUsername();
    }

    // calculate score
    function scoreCalculator(){
        const questions = document.querySelectorAll("#question-container");
        let score = 0;

        questions.forEach((question) => {
            const playerAnswer = question.querySelector("input[type='radio']:checked");
            if (playerAnswer && playerAnswer.dataset.correct === "true") {
                score += 1;
            }
        });

        return score;
    }

    // Save score
    function savePlayerScore(player, score) {
        const scores = JSON.parse(localStorage.getItem("scores")) || [];
        scores.push({player, score});
        localStorage.setItem("scores", JSON.stringify(scores));

    }

    // Display scores
    function displayScores() {
        const tableBody = document.querySelector("#score-table tbody");
        tableBody.innerHTML = "";

        const scores = JSON.parse(localStorage.getItem("scores")) || [];

        scores.forEach((playerScore) => {
            const row = document.createElement("tr");
            row.innerHTML = `<td>${playerScore.player}</td>
                            <td>${playerScore.score}</td>`;
            tableBody.appendChild(row);
        })
    }

});