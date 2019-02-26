function getUrbanAreas() {
    console.log(urbanAreaNames);
    let userInputUA = Object.keys(urbanAreaNames);
    for (let i = 0; i < userInputUA.length; i++) {
        let urbanAreaDropdownlist = `<option value="${urbanAreaNames[userInputUA[i]]}">${userInputUA[i]}</option>`
        $('#urbanAreas-Dropdown').append(urbanAreaDropdownlist);
    }
    $('#urbanAreas-Dropdown').chosen();
}
function setupDropdownSubmit() {
    $('#urbanAreasForm').submit(event => {
        event.preventDefault();
        let userInput = $('#urbanAreas-Dropdown').val();
        console.log(`user input is`, userInput);
    })
}
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
function getDataByCoordinates(objArr) {
    let latitude = objArr.latitude
    let longitude = objArr.longitude
    let latLongCoor = latitude + "," + longitude
    console.log(latLongCoor);
    getTeleportLocationData(latLongCoor)

}

function getTeleportLocationData(coordinates) {
    fetch(`https://api.teleport.org/api/locations/${coordinates}`)
        .then(response => response.json())
        .then(obj => {
            console.log(obj);
            return getTeleportScores(obj);

        })
}

function getTeleportScores(coordinateArr) {
    let coorURL = coordinateArr["_embedded"]["location:nearest-urban-areas"][0]["_links"]["location:nearest-urban-area"]["href"]
    console.log(`the link is`, coorURL);
    let scoreURL = coorURL + 'scores/'
    fetch(scoreURL)
        .then(response => response.json())
        .then(scoreRes => {
            console.log(`score information is`, scoreRes)
            return displayResults(scoreRes);
        })
}
function displayResults(scoreArr) {
    $('#results-one').removeClass('hidden')
    for (i = 0; i <scoreArr.length; i++) {
        const categoryNameScore = `<ul>${scoreArr.categories[i].name}<li>Score:${scoreArr.categories[i].score_out_of_10}</li></ul>`
console.log(categoryNameScore);
    }
}

/*
        fetch(`https://api.teleport.org/api/urban_areas/slug:${userInput}/scores/`)
.then(response=>response.json())
.then(obj=>{
    console.log(obj)
})
    });
    

}*/
currentlocationSubmit();
getUrbanAreas();
setupDropdownSubmit();