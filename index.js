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
    fetch('https://api.ipify.org?format=json')
        .then(response => response.json())
        .then(obj => {
            console.log(obj)
            return getTeleportLocationData(obj);
        })

}
//gets teleport location data based on Ipaddress
function getTeleportLocationData(objArr) {
    let userIpAddress = objArr.ip
    console.log(`Ip address is ${userIpAddress}`)
    fetch(`https://api.teleport.org/api/ipaddresses/${userIpAddress}`)
        .then(response => response.json())
        .then(obj => {
            console.log(`Ip address data is`, obj);
            return getDataByIpInput(obj)
            /*return getTeleportScores(obj);*/

        })
}
function getDataByIpInput(objArr) {
    let geoNameId = objArr["_links"]["ip:city"]["href"]
    console.log(geoNameId)
    fetch(geoNameId)
        .then(response => response.json())
        .then(obj => {
            console.log(obj)
            return getTeleportScores(obj)
        })

}
//gets scores data from teleport based on the location data from coordinates
function getTeleportScores(geoIdFromIpObj) {
    let ipInputUrl = geoIdFromIpObj["_links"]["city:urban_area"]["href"]
    console.log(`the link is`, ipInputUrl);
    let scoreURL = ipInputUrl + 'scores/'
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
function normalizeSummary(summaryStr) 
{ return summaryStr.split('<p>').filter(i => !!i)[0].replace('</p>', '') }

function displayPrimaryCityResults(){
    $('#compareCity').show();
    $('#results-one').show();
    $('#results-one').removeClass('hidden')
    let citySummary = normalizeSummary(STORE.primaryData.summary);
    $('#results-one').append(`<p>${citySummary}</p>`);
    let overallCityScore = `<p>Overall Score: ${STORE.primaryData.teleport_city_score.toFixed(2)}</p>`
    $('#results-one').append(overallCityScore);
    
}

function updateDOM() {
    $('#results-one').empty();
    if (STORE.primaryData === null) {
        $('#compareCity').hide();
        $('#results-one').hide();
        return
    }
    
    displayPrimaryCityResults()
    //getTableResults()
   let tableHTML=`<table>`
    let primarySelectedCity=$('#urbanAreas-Dropdown option:selected').text()
    let secondarySelectedCity = $('#urbanAreas-Dropdown-secondary option:selected').text();
    let tableHeadCityName =
        `<tr class="header-wrapper">
        <th class="categories">Categories</th>
        <th class="primaryCity">${primarySelectedCity}</th>
        <th class="secondaryCity">${secondarySelectedCity}</th>
        <th class="percentDifference">Percent Difference</th>
        <tr>`
    
   tableHTML += tableHeadCityName
    //

//calculates the percent diff of cities
const scoreArr = STORE.primaryData.categories
    
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
//puts the scores in the DOM
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

        tableHTML +=categoryNameScore

    }
    tableHTML += '</table>'
    $('#results-one').append(tableHTML)

    if (!STORE.secondaryData) {
        $('.diffValue').hide()
        $('.primaryCity').hide()
        $('.secondaryCity').hide()
   $('.percentDifference').hide()
    }
//*/
}
function watchForm() {
    urbanAreasDropdown();
    setupDropdownSubmit();
    setupSecondaryDropdownSubmit();
    updateDOM();
}
watchForm();