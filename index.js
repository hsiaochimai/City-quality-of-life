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
function startOver(){
    $('#start-over').click(e=>{
        console.log(`start over ran`)
        location.reload();
    })
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
    STORE.message=null
    updateDOM()
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
    STORE.message=null
    updateDOM()
    fetch('https://api.ipify.org?format=json')
        .then(response => response.json())
        .then(obj => {
            console.log(obj)
            return getTeleportLocationData(obj);
        }).catch(e => {
            console.log('ERR:', e.toString())
            STORE.message = "Network error, sorry. Please check your internet connection and retry"
            updateDOM()
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

        })
}
function getDataByIpInput(objArr) {
    let geoNameId = objArr["_links"]["ip:city"]["href"]
    console.log(geoNameId)
    if(!objArr["_links"]["ip:city"]){
        console.error('NO DATA')
    STORE.message = "No data, sorry"
    updateDOM()
    return
    }
    else{
    fetch(geoNameId)
        .then(response => response.json())
        .then(obj => {
            console.log(obj)
            return getTeleportScores(obj)
        })
    }

}
//gets scores data from teleport based on the location data from coordinates
function getTeleportScores(geoIdFromIpObj) {
    if (!geoIdFromIpObj["_links"]["city:urban_area"]) {
        console.error('NO DATA')
        STORE.message = "No data, sorry"
        updateDOM()
        return
    }
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
function normalizeSummary(summaryStr) { return summaryStr.split('<p>').filter(i => !!i)[0].replace('</p>', '') }

function displayPrimaryCityResults() {
    $('#compareCity').show();
    $('#results-one').show();
    $('#results-one').removeClass('hidden')
    let primaryCitySummary = normalizeSummary(STORE.primaryData.summary);
    $('#results-one').append(`<div class="primaryCitySumScore">
    <p>${primaryCitySummary}</p>
    <p>Overall Score: ${STORE.primaryData.teleport_city_score.toFixed(2)}</p>
    </div>
    `);

}
function displaySecondaryCitySummary() {
    let secondarycitySummary = normalizeSummary(STORE.secondaryData.summary);
    $('#results-one').append(`<div class="secondaryCitySumScore"
    <p class="secondaryCitySumScore">${secondarycitySummary}</p>
    <p class="secondaryCitySumScore">Overall Score: ${STORE.secondaryData.teleport_city_score.toFixed(2)}</p>
    </div>
    `
    );
    
}
function getTableResults() {
    let tableHTML = `<table>`
    let primarySelectedCity = $('#urbanAreas-Dropdown option:selected').text()
    let secondarySelectedCity = $('#urbanAreas-Dropdown-secondary option:selected').text();
    let tableHeadCityName =
        `<tr class="header-wrapper">
         <th scope="col" class="categories">Categories</th>
         <th scope="col" class="categories2"></th>
         <th scope="col" class="primaryCity">${primarySelectedCity}</th>
         <th scope="col" class="secondaryCity">${secondarySelectedCity}</th>
         <th scope="col" class="percentDifference">Percent Difference</th>
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
             <td scope="row" class="scoreName">${scoreArr[i].name}</td>
             <td scope="row" class="scoreValue">
             ${scoreArr[i].score_out_of_10.toFixed(2)}            
             </td>
             <td scope="row" class="secValue">
             ${secondaryValue}            
             </td>
             <td scope="row" class="diffValue">
             ${percentDiff}            
             </td>
             
         </tr>`

        tableHTML += categoryNameScore

    }
    tableHTML += '</table>'
    $('#results-one').append(tableHTML)
}

function updateDOM() {

    if (STORE.message) {
        $('#message').show()
        $('#message').html(STORE.message)
    } else {
        $('#message').hide()
    }


    $('#results-one').empty();
    if (STORE.primaryData === null) {
        $('#compareCity').hide();
        $('#results-one-container').hide();
        $('#results-one').hide();
        $('#start-over').hide();
        return
    }
    else{
        $('#start-over').show();
        $('#results-one-container').show();

    }
    displayPrimaryCityResults()
    if (STORE.secondaryData) {
        displaySecondaryCitySummary()
    }
    getTableResults()
    if (!STORE.secondaryData) {
        $('.secValue').hide()
        $('.diffValue').hide()
        $('.primaryCity').hide()
        $('.secondaryCity').hide()
        $('.percentDifference').hide()
    }
    else{
        $('.categories2').hide()
    }
}
function watchForm() {
    urbanAreasDropdown();
    startOver();
    setupDropdownSubmit();
    setupSecondaryDropdownSubmit();
    updateDOM();
}
watchForm();