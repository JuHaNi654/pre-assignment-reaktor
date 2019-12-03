const fs = require('fs');


// Function that returns resolve if package data is avaible
// if files are unavaible then it rejects with error
const getPackages = () => {
    return new Promise((resolve, reject) => {
        try {
            const data = fs.readFileSync('/var/lib/dpkg/status', 'utf8')
            resolve(parseData(data))
        } catch (err) {
            try {
                const data = fs.readFileSync('./mock-data/status.real', 'utf8')
                resolve(parseData(data))
            } catch {
                reject(err)
            }
        }
    })
}

/**
 * Function takes status file data and modify to objects
 * @param {string} data - string of packages from ubuntu status file.
 * @returns array of package objects
 */
function parseData(data) {
    let dataArray = splitPackages(data)
    let newArray = []
    for (let i = 0; i < dataArray.length; i++) {
        newArray.push(createObj(dataArray[i]))
    }
    // List new array of packages with new attribute on it
    let updatedArray = filterDepends(newArray)
    return updatedArray
}

/**
 * Function add new attribute to each packages
 * @param Depends - Updated value wich version numbers are removed
 * @param packagesDepends - new attribute. 
 * Includes wich packages depends on current iteration package
 * @param {Array<objects>} data - takes array of listed pacakges
 * @returns array of packages with new attribute on it
 */
function filterDepends(data) {
    return data.map((package) => {
        return {
            Package: package.Package,
            Description: package.Description,
            Depends: removeExtraChars(package.Depends),
            packagesDepends: findDepends(package.Package, data)
        }
    })
}


/**
 * 
 * @param {String} depends - given value wich current iteration package depends
 * @returns package names without version numbers on it  
 */
function removeExtraChars(depends) {
    let regex1 = /\s\((.*?)\)/g

    if (depends !== undefined) {
        // removes dependency version numbers
        let withoutVersionNumber = depends.replace(regex1, '')
        //split to array if there is , or |
        withoutVersionNumber = withoutVersionNumber.split(/[,|]+/)
        //remove extra space from array items
        withoutVersionNumber = withoutVersionNumber.map(item => item.trim())
        // return without duplicate names
        return [...new Set(withoutVersionNumber)]
    }

    return null
}


/**
 * Function filter packages wich depends given package name
 * @param {string} package - current package name
 * @param {Array<object>} arr - listed package objects
 * @returns array of package name wich depends given package name
 */
function findDepends(package, arr) {
    let dependArr = []
    for (let i = 0; i < arr.length; i++) {
        // if given iteration package doesent have depends then skip
        if (arr[i].Depends === undefined) continue
        // if iteration package depends given package name then push to array
        if (arr[i].Depends.includes(package)) {
            dependArr.push(arr[i].Package)
        }
    }
    return dependArr
}

/**
 * Function split given list of string packages
 * and removes empty arrays from the splitted arrayPackages
 * @param {string} list - list of installed packages
 * @returns Listed array of splited packages to own array
 */
function splitPackages(list) {
    let packageArray = []
    let arrayOfPackages = list.split(/(\n\n)/)
    for (let i = 0; i < arrayOfPackages.length; i++) {
        let filteredArray = arrayOfPackages[i].split(/\n/).filter(Boolean)
        packageArray.push(filteredArray)
    }
    return packageArray.filter(x => x.length !== 0)
}

/**
 * Function take array of strings from single package and combines
 * some of the text if package attribute has multiline text
 * @param {Array<string>} arr - single given package array data 
 * @returns @function objectify returns function call of combined text
 */
function createObj(arr) {
    let regex = /(^\w.+:)/
    let newObj = []
    let text

    for (let i = 0; i < arr.length; i++) {
        let curVal = arr[i]
        let nextVal = arr[i + 1]
        // If given string is start of package attribute
        if (curVal.match(regex)) {
            // Checks if there is next string or it is last iteration item
            if (nextVal === undefined) {
                newObj.push(curVal)

            }
            // Checks if next iteration item is new attribute
            else if (nextVal.match(regex)) {
                newObj.push(curVal)

            }
            // Set start of attribute if there is multiline text
            else {
                text = curVal
            }
        }
        // Combines all of the multiline attribute text
        else {
            text = text + " " + curVal
            if (nextVal === undefined) {
                newObj.push(text)
            } else if (nextVal.match(regex)) {
                newObj.push(text)
            }
        }
    }
    return objectify(newObj)
}


/**
 * Function modify given array of strings returns as a object attributes
 * @param {Array<string>} data - array of strings wich are from single package data
 * @returns package as a object with attributes on it.
 */
function objectify(data) {
    var obj = {}
    for (let i = 0; i < data.length; i++) {
        // Each iteration items are splitted to attribute name and value
        let keysAndValues = data[i].split(/:(.+)/).filter(Boolean)
        /**
         * If attribute key has multi word with dash on it
         * then it will combine those words, so it will be easier to access
         */
        if (keysAndValues[0].match(/-/)) {
            keysAndValues[0] = keysAndValues[0].replace(/-/, '')
        }
        // Inserting attribute and the value to the object
        // In values removed extra spaces
        obj[keysAndValues[0]] = keysAndValues[1].replace(/\s{2,}/gm, "").trim()

    }
    return obj
}


module.exports = getPackages()