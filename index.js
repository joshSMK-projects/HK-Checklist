let current = 0;

let currFrags = 0;
const maxFrags = 9;

let currShards = 0;
const maxShards = 16; 

const percent = document.querySelector('#percent');
const totalEl = document.querySelectorAll('div > div:not(#other) > ul > li > input'); 
const extraEl = document.querySelectorAll('div > div#other > ul > li > input');

const fragments = document.querySelector('#vessel_fragments > h3');
const fragPlus = document.querySelector('#frag_plus');
const fragMinus = document.querySelector('#frag_minus');

const shards = document.querySelector('#mask_shards > h3');
const shardPlus = document.querySelector('#shard_plus');
const shardMinus = document.querySelector('#shard_minus');

let elements = [...totalEl, fragments, shards, ...extraEl]; //(...) spread operator works similarly to unpack operator in Python
let weightEl = [];
let currentData = [];

//local storage
const savedData = JSON.parse(localStorage.getItem('data'));

//If there is saved data
if (savedData) {
    //Reinput saved data
    percent.textContent = savedData[0];
    current = parseFloat(savedData[0]); //returns string so parse

    elements.forEach((element, index) => {
        if (element.checked != undefined) //h3 has no checked attr. so its undefined
            element.checked = savedData[index+1];
        else
            element.textContent = savedData[index+1];
    });

    currFrags = fragments.textContent;
    currShards = shards.textContent;

    //configure buttons for shards/fragments
    if (fragments.textContent >= maxFrags) {
        fragPlus.disabled = true;
        fragMinus.disabled = false;
    }
    else if (fragments.textContent < maxFrags && fragments.textContent > 0)
        fragMinus.disabled = false;
    else {
        fragPlus.disabled = false;
        fragMinus.disabled = true;
    }

    if (shards.textContent >= maxShards) {
        shardPlus.disabled = true;
        shardMinus.disabled = false;
    }
    else if (shards.textContent < maxShards && shards.textContent > 0)
        shardMinus.disabled = false;
    else {
        shardPlus.disabled = false;
        shardMinus.disabled = true;
    }
}

class Weight {
    constructor(id, weight) {
        this.id = id;
        this.weight = weight;
    }
    static assign(list) { //Use id's since we can't give h3 element a name property
        list.forEach((e) => {
            if (e.id === 'Shards') 
                weightEl.push(new Weight(e.id, 0.25));
            else if (e.id === 'Fragments')
                weightEl.push(new Weight(e.id, 0.33));
            else if (e.id === 'Isma\'s Tear' || e.id === 'King\'s Brand' || e.id === 'Monarch Wings' || e.id === 'Shade Cloak')
                weightEl.push(new Weight(e.id, 2));
            else if (e.id === "Swim Ability" || e.id === "Tram Pass" || e.id === "Elevator Pass" || e.id === "Lumafly Lanturn")
                weightEl.push(new Weight(e.id, 0));
            else
                weightEl.push(new Weight(e.id, 1));
        });
    }
}

Weight.assign(elements);

//NodeLists have different functions to arrays
function render(element, sign) {
    //Find the weighted object associated with the element
    let weighted = weightEl.find((item) => {
        return element === item.id;
    });

    //Find the actual element to display the change
    let actualEl = elements.find((item) => {
        return item.id === weighted.id;
    });

    if (actualEl.checked || sign === '+') {
        if (actualEl.id === 'Fragments') { //Fragments + button activation/deactivation
            currFrags++;

            if (currFrags % 3 === 0 && currFrags !== 0) { //case of 3 frags - 0.99
                current += 0.01;
            }

            fragments.textContent = currFrags;

            if (currFrags >= maxFrags)
                fragPlus.disabled = true;

            if (fragMinus.disabled)
                fragMinus.disabled = false; 
        }
        else if (actualEl.id === 'Shards') { //Shards + button activation/deactivation
            currShards++;

            shards.textContent = currShards;

            if (currShards >= maxShards)
                shardPlus.disabled = true;

            if (shardMinus.disabled)
                shardMinus.disabled = false;
        }

        current = parseFloat((current + weighted.weight).toFixed(2)); //Sets precision of floats - returns a string which we need to convert to float to reuse toFixed
    }
    else if (!actualEl.checked || sign === '-') { //Revert progression
        if (actualEl.id === 'Fragments') {

            if (currFrags % 3 === 0 && currFrags != 0) { //3, 6, 9 only
                current -= 0.01;
            }
            currFrags--;
            fragments.textContent = currFrags;

            if (currFrags <= 0)
                fragMinus.disabled = true;

            if (fragPlus.disabled)
                fragPlus.disabled = false;
        }
        else if (actualEl.id === 'Shards') {
            currShards--;

            shards.textContent = currShards;

            if (currShards <= 0)
                shardMinus.disabled = true;

            if (shardPlus.disabled)
                shardPlus.disabled = false;
        }

        current = parseFloat((current - weighted.weight).toFixed(2));
    }

    percent.textContent = current;

    //Everytime we render we push the values to localStorage
    collectData();
    localStorage.setItem('data', JSON.stringify(currentData));
}

//Collects the current state of the document to currentData with the total percentage being the first element
function collectData() {
    currentData[0] = percent.textContent;

    elements.forEach((element, index) => {
        if (element.checked != undefined) //h3 has no checked attr. so its undefined
            currentData[index+1] = element.checked;
        else
            currentData[index+1] = element.textContent;
    });
}

function reset() {
    current = 0;
    currFrags = 0;
    currShards = 0;
    percent.textContent = 0;

    elements.forEach((element) => {
        if (element.checked != undefined) { //find checkboxes
            if (element.checked)
                element.checked = false;
        }
        else {
            element.textContent = 0;
        }
    });

    fragPlus.disabled = false;
    fragMinus.disabled = true;

    shardPlus.disabled = false;
    shardMinus.disabled = true;

    //Collect info on inputs and pushes to localstorage
    collectData();
    localStorage.setItem('data', JSON.stringify(currentData));
}
