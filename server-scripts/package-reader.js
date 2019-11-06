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
 * @data all the package data from status file
 * @return array with packages as objects
 * 
 */
function parseData(data) {
    let dataArray = splitPackages(data)
    let newArray = []
    for (let i = 0; i < dataArray.length; i++) {
        newArray.push(createObj(dataArray[i]))
    }
    let updatedArray = filterDepends(newArray)
    return updatedArray
}

/**
 * @param data takes all the package object array
 * @return return package object array with selected attributes
 * @param packagesDepends attribute values are the package names array wich depends on this package
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


// Removes version numbers and then duplicates
/**
 * 
 * @param {*} text takes Depends with version number and then returns only depend array title
 */
function removeExtraChars(text) {
    let regex1 = /\s\((.*?)\)/g

    if (text !== undefined) {
        // removes dependency version numbers
        let x = text.replace(regex1, '')
        //split to array if there is , or |
        x = x.split(/[,|]+/)
        //remove extra space from array items
        x = x.map(item => item.trim())
        // return with unqiue item names
        return [...new Set(x)]
    }

    return null
}


/**
 * 
 * @param {*} package given package name
 * @param {*} arr given array list of packages
 * @param dependArr list of package names that depends on given package name
 */
function findDepends(package, arr) {
    let dependArr = []
    for (let i = 0; i < arr.length; i++) {

        if (arr[i].Depends === undefined) continue
        if (arr[i].Depends.includes(package)) {
            dependArr.push(arr[i].Package)
        }
    }
    return dependArr
}

/**
 * 
 * @param e list of given packages
 * @param x takes list of packages after splitting packages to their own objects
 * @param packageArray takes nested package data arrays and filters empety array off

 */
function splitPackages(e) {
    let packageArray = []
    let x = e.split(/(\n\n)/)
    for (let i = 0; i < x.length; i++) {
        let z = x[i].split(/\n/).filter(Boolean)
        packageArray.push(z)
    }
    return packageArray.filter(x => x.length !== 0)
}

/**
 * 
 * @param {*} e takes single package array data
 * compines rows with text and then returns with @function objectify wich returns as object
 */
function createObj(e) {
    let obj = e
    let regex = /(^\w.+:)/
    let newObj = []
    let text

    for (let i = 0; i < obj.length; i++) {
        let curVal = obj[i]
        let nextVal = obj[i + 1]
        if (curVal.match(regex)) {
            if (nextVal === undefined) {
                newObj.push(curVal)
            } else if (nextVal.match(regex)) {
                newObj.push(curVal)
            } else {
                text = curVal
            }
        } else {
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
 * 
 * @param {*} data package with array dasta as array
 * @return package as object with key and value attributes
 */
function objectify(data) {
    var obj = {}
    for (let i = 0; i < data.length; i++) {
        let x = data[i].split(/:(.+)/).filter(Boolean)
        // If in key has dash then it will remove the dash and compine those words
        if (x[0].match(/-/)) {
            x[0] = x[0].replace(/-/, '')
        }
        obj[x[0]] = x[1].replace(/\s{2,}/gm, "").trim()
    }
    return obj
}


module.exports = getPackages()