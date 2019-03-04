const STORE = {
    // currentSlug: null,
    // compareSlug: null,
    compare: false,
    columnCount: 0,
    columnSlugs: [],
    scoresBySlug: {}
}

function fetchDataForSlug(slug) {
    return fetch(`https://api.teleport.org/api/urban_areas/slug:${slug}/scores/`)
        .then(response => response.json())
        .then(obj => {
            console.log('slug data', obj)
            STORE.scoresBySlug[slug] = obj
        })
}

function setupCompare() {
    $('#compare').on('change', ev => {
        const checked = $(ev.target).is(":checked")
        if (checked) {
            $('#column-1').show()
        } else {
            $('#column-1').hide()
        }
        STORE.compare = checked
    })
}

function displayData(slug, columnElement) {
    const container = $(columnElement).find('ul')
    const data = STORE.scoresBySlug[slug]
    const categs = ["Cost of Living", "Housing", "Healthcare"]
    const dataArr = data.categories.filter(i => categs.includes(i.name))
    //container.append(JSON.stringify(dataArr))
    container.empty()
    dataArr.forEach(i => {
        container.append(`<li>${i.name}: ${i.score_out_of_10}</li>`)
    })
}

function setupFormSubmit(columnElement, id) {
    const formElement = $(columnElement).find('form')
    $(formElement).submit(event => {
        event.preventDefault();
        let userInput = $(formElement).find('select').val();
        console.log(`user input is`, userInput);
        STORE.columnSlugs[id] = userInput
        fetchDataForSlug(userInput).then(data => {
            columnElement.find('.results').removeClass('hidden')
            displayData(userInput, columnElement)
            $('#compare').show()
        })
        // getDataFromDropdown(userInput)
    })
}

function makeDataColumn(slug) {
    const id = STORE.columnCount++
    const html = `
<div class="data-column" id="column-${id}">
        <form >
        <select name= "Choose a city" single="">
        <input type="submit" value="Fetch!">
        </select>
    </form>
    <section class="results hidden">
        <ul>
        </ul>
    </section>
</div>
    `
    const $el = $(html)
    $('#columns').append($el)
    let userInputUA = Object.keys(urbanAreaNames);
    for (let i = 0; i < userInputUA.length; i++) {
        let urbanAreaDropdownlist = `<option value="${urbanAreaNames[userInputUA[i]]}">${userInputUA[i]}</option>`
        $el.find('select').append(urbanAreaDropdownlist);
    }
    $el.find('select').chosen();
    setupFormSubmit($el, id)

}

$(() => {

    makeDataColumn()
    makeDataColumn()
    // $('#column-1').hide()
    setupCompare()

})