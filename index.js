//gets keys for dropdown menus
function urbanAreasDropdown() {
    console.log(urbanAreaNames);
    let userInputUA = Object.keys(urbanAreaNames);
    for (let i = 0; i < userInputUA.length; i++) {
        let urbanAreaDropdownlist = `<option value="${urbanAreaNames[userInputUA[i]]}">${userInputUA[i]}</option>`
        $('#urbanAreas-Dropdown').append(urbanAreaDropdownlist);
        $('#urbanAreas-Dropdown-secondary').append(urbanAreaDropdownlist);

    }
    $('#urbanAreas-Dropdown').chosen();
    $('#urbanAreas-Dropdown-secondary').chosen();
}
// sets up fetch button to get the data from teleport from value of dropdown
function setupDropdownSubmit() {
    $('#urbanAreasForm').submit(event => {
        event.preventDefault();
        $("header").hide();
        $('#results-one').removeClass('hidden')
        let userInput = $('#urbanAreas-Dropdown').val();
        console.log(`user input is`, userInput);
        if (userInput === "Current Location") {
            currentlocationSubmit();
        }
        else {

            getDataFromDropdown(userInput, true)
        }
    })
}
// sets up submit for comparing cities
function setupSecondaryDropdownSubmit() {
    $('#urbanAreasForm-secondary').submit(event => {
        event.preventDefault();
        let userInput = $('#urbanAreas-Dropdown-secondary').val();
        console.log(`secondary user input is`, userInput);
        if (userInput === "Current Location") {
            currentlocationSubmit();
        }
        else {
            getDataFromDropdown(userInput, false)
        }
    })
}
//gets data from teleport based on the value of dropdown menu
function getDataFromDropdown(dropdownUserInput, isPrimary) {
    fetch(`https://api.teleport.org/api/urban_areas/slug:${dropdownUserInput}/scores/`)
        .then(response => response.json())
        .then(obj => {
            STORE[isPrimary ? 'primaryData' : 'secondaryData'] = obj
            if (isPrimary) {
                //to do enable the secondary chosen 
            } else {
                //compute comparison
            }
            return updateDOM(obj, isPrimary);
        })
}
// sets up submit for current location
function currentlocationSubmit() {
    fetch('http://api.ipstack.com/check?access_key=8a13d7be3d84524ef68a4533c1352b8f')
        .then(response => response.json())
        .then(obj => {
            return getDataByCoordinates(obj)


        });
}
//uses coordinates from ip stack to get data from teleport
function getDataByCoordinates(objArr) {
    let latitude = objArr.latitude
    let longitude = objArr.longitude
    let latLongCoor = latitude + "," + longitude
    console.log(latLongCoor);
    getTeleportLocationData(latLongCoor)

}
//gets teleport location data based on coordinates
function getTeleportLocationData(coordinates) {
    fetch(`https://api.teleport.org/api/locations/${coordinates}`)
        .then(response => response.json())
        .then(obj => {
            console.log(`coordinates data is`, obj);
            return getTeleportScores(obj);

        })
}
//gets scores data from teleport based on the location data from coordinates
function getTeleportScores(coordinateArr) {
    let coorURL = coordinateArr["_embedded"]["location:nearest-urban-areas"][0]["_links"]["location:nearest-urban-area"]["href"]
    console.log(`the link is`, coorURL);
    let scoreURL = coorURL + 'scores/'
    fetch(scoreURL)
        .then(response => response.json())
        .then(scoreRes => {
            console.log(`score information is`, scoreRes)
            if (STORE.primaryData === null) {
                STORE.primaryData = scoreRes
                updateDOM();
            }
            else {
                STORE.secondaryData = scoreRes

            }

            updateDOM();
        })
}
function normalizeSummary(summaryStr) { return summaryStr.split('<p>').filter(i => !!i)[0].replace('</p>', '') }
//puts results into the DOM
function updateDOM() {
    $('#results-one').empty();
    if (STORE.primaryData === null) {
        $('#compareCity').hide();
        $('#results-one').hide();
        return
    }
    $('#compareCity').show();
    $('#results-one').show();
    const scoreArr = STORE.primaryData.categories
    $('#results-one').removeClass('hidden')
    let citySummary = normalizeSummary(STORE.primaryData.summary);
    $('#results-one').append(`<p>${citySummary}</p>`);
    let overallCityScore = `<p>Overall Score: ${STORE.primaryData.teleport_city_score.toFixed(2)}</p>`
    $('#results-one').append(overallCityScore);
    let tableHTML = `<table>`
    for (i = 0; i < scoreArr.length; i++) {
        let percentDiff = ''
        let secondaryValue = ''
        if (STORE.secondaryData) {
            const pValue = scoreArr[i].score_out_of_10
            const secValue = STORE.secondaryData.categories[i].score_out_of_10
            if (secValue !== 0) {
                secondaryValue = secValue.toFixed(2)
                percentDiff = 100 - pValue / secValue * 100
                percentDiff = `${percentDiff.toFixed(2)}%`
                console.log(scoreArr[i].name, pValue, secValue, percentDiff)
            }
        }
        const selectedCityName=$('#urbanAreas-Dropdown').val();

            const tableHeadCityName=`<th>${selectedCityName}</th>`
            tableHTML+=tableHeadCityName
        
            

        const categoryNameScore = `
        <tr class="scoreRowWrapper">
            
            <td class="scoreName">${scoreArr[i].name}</td>
            <td class="scoreValue">
            ${scoreArr[i].score_out_of_10.toFixed(2)}            
            </td>
            <td class="diffValue">
            ${secondaryValue}            
            </td>
            <td class="diffValue">
            ${percentDiff}            
            </td>
            
        </tr>`
        
       tableHTML+=categoryNameScore

    }
    tableHTML+='</table>'
    $('#results-one').append(tableHTML)

    if (!STORE.secondaryData) {
        $('.diffValue').hide()
    }

    /*function displaySecondary() {
        $('#results-two').empty();
        if (STORE.secondaryData === null) {
            return
        }
        const scoreArr = STORE.secondaryData.categories
        //$('#results-two').removeClass('hidden')
        //let citySummary = normalizeSummary(STORE.secondaryData.summary);
        //$('#results-two').append(citySummary);
        //let overallCityScore = `<p>Overall Score: ${STORE.secondaryData.teleport_city_score.toFixed(2)}</p>`
        //$('#results-two').append(overallCityScore);

        for (i = 0; i < scoreArr.length; i++) {
            const categoryNameScore = `
            <tr>
                
                <td class="scoreName">${scoreArr[i].name}</td>
                <td class="scoreValue">${scoreArr[i].score_out_of_10.toFixed(2)}</td>
                
            </tr>`
            $('#results-two').append(categoryNameScore);

        }
    }
    displaySecondary();*/
}
function watchForm() {
    urbanAreasDropdown();
    setupDropdownSubmit();
    setupSecondaryDropdownSubmit();
    updateDOM();
}
watchForm();