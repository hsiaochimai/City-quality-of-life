//gets keys for dropdown menu
function urbanAreasDropdown() {
    console.log(urbanAreaNames);
    let userInputUA = Object.keys(urbanAreaNames);
    for (let i = 0; i < userInputUA.length; i++) {
        let urbanAreaDropdownlist = `<option value="${urbanAreaNames[userInputUA[i]]}">${userInputUA[i]}</option>`
        $('#urbanAreas-Dropdown').append(urbanAreaDropdownlist);
    }
    $('#urbanAreas-Dropdown').chosen();
}
// sets up fetch button to get the data from teleport from value of dropdown
function setupDropdownSubmit() {
    $('#urbanAreasForm').submit(event => {
        event.preventDefault();
        let userInput = $('#urbanAreas-Dropdown').val();
        console.log(`user input is`, userInput);
        getDataFromDropdown(userInput, true)
    })
}
// sets up submit for comparing cities
function setupSecondaryDropdownSubmit() {
    $('#urbanAreasForm-secondary').submit(event => {
        event.preventDefault();
        let userInput = $('#urbanAreas-Dropdown').val();
        console.log(`user input is`, userInput);
        getDataFromDropdown(userInput, false)
    })
}
//gets data from teleport based on the value of dropdown menu
function getDataFromDropdown(dropdownUserInput, isPrimary){
    fetch(`https://api.teleport.org/api/urban_areas/slug:${dropdownUserInput}/scores/`)
    .then(response=>response.json())
    .then(obj=>{
        STORE[isPrimary?'primaryData':'secondaryData']=obj
        if(isPrimary){  
            //to do enable the secondary chosen 
        }else{
            //compute comparison
        }
        return displayResults(obj, isPrimary);
    })
}
// sets up submit for current location
function currentlocationSubmit() {
    $('#current-location').submit(event => {
        event.preventDefault();
        fetch('http://api.ipstack.com/check?access_key=8a13d7be3d84524ef68a4533c1352b8f')
            .then(response => response.json())
            .then(obj => {
                return getDataByCoordinates(obj)
            })
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
            console.log(obj);
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
            displayResults(scoreRes);
        })
}
//puts results into the DOM
function displayResults(scoreArr) {
    $('#results-one').empty();
    $('#results-one').removeClass('hidden')
    let citySummary= scoreArr.summary;
    $('#results-one').append(citySummary);
    let overallCityScore= `<p>Overall Score: ${scoreArr.teleport_city_score}</p>`
    $('#results-one').append(overallCityScore);
    
    for (i = 0; i <scoreArr.categories.length; i++) {
        const categoryNameScore = `<ul>${scoreArr.categories[i].name}<li>Score:${scoreArr.categories[i].score_out_of_10}</li></ul>`  
        $('#results-one').append(categoryNameScore);
        storeData(citySummary, overallCityScore, categoryNameScore);
    }
    
}
function storeData(summary, cityScore, categoryScore){
    STORE.items.push(summary);
    STORE.items.push(cityScore);
    STORE.items.push(categoryScore);
    console.log(`This is in the`,STORE)
}

currentlocationSubmit();
urbanAreasDropdown();
setupDropdownSubmit();