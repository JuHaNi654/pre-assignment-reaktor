$.get("http://localhost:8080/api/packages", function (data) {
    $.each(data, (index, obj) => {
        let row = createTableRow(index)
        let column = createTableColumn(obj)
        row.appendChild(column)
        $("#table-body").append(row)
    })
});
/**
 * 
 * @param {number} index id of package
 */
function createTableRow(index) {
    let tableRow = document.createElement("tr")
    tableRow.setAttribute("onclick", "openRow(this)")
    tableRow.setAttribute("id", index)
    tableRow.setAttribute("tabindex", "0")

    return tableRow
}

/**
 * function creates column element with package data
 * @param {object} obj takes package object
 */
function createTableColumn(obj) {
    let tableColumn = document.createElement("td")
    let packageName = document.createTextNode(obj.Package)
    tableColumn.appendChild(packageName)

    tableColumn.appendChild(createPackageInfo(obj.Description, obj.Depends, obj.packagesDepends))

    return tableColumn
}
/**
 * 
 * @param {string} description Package description
 * @param {Array<string>} depends Package that depends other packages
 * @param {Array<string>} otherDepends Other packages that depends on this package
 */
function createPackageInfo(description = null, depends = null, otherDepends = null) {
    let desc = createNode(description)
    let depend = `<ul class="list-container">${createButton(depends)}</ul>`
    let otherDepend = `<ul class="list-container">${createButton(otherDepends)}</ul>`
    let container = document.createElement("div")


    container.classList.add("row-container")
    container.setAttribute("id", "cont")
    $(container).append(
        "<h4>Description:</h4>",
        desc,
        "<h4>This package depends on:</h4>",
        depend,
        "<h4>Other packages depends on this:</h4>",
        otherDepend
    )
    $(container).hide()

    return container
}
/**
 * 
 * @param {Array<string>} data array of depends and return clickable version of it
 */
function createButton(data) {
    if (data !== null && data.length > 0) {
        return data.map(item => {
            return `<li><a class="btn" onclick=(navFunction(this))>${item}</a></li>`
        }).join(' ')

    }
    return '-'
}
/**
 * 
 * @param {string} text passed desciption paragraph
 * Create p html element and inject passed text value 
 */
function createNode(text) {
    let textNode = document.createElement("p")
    if (text === null) return document.createTextNode("-")
    let textAttribute = document.createTextNode(text)
    textNode.appendChild(textAttribute)
    return textNode
}
/**
 * 
 * @param {*} val when clicked depend it will navigate to the package
 */
function navFunction(val) {
    let listedPackages = document.querySelectorAll("tr")
    for (let i = 0; i < listedPackages.length; i++) {
        if (listedPackages[i].innerText === val.innerText) {
            let id = listedPackages[i].getAttribute("id")
            //Scrolls selected package to the center
            document.getElementById(id).scrollIntoView({ block: "center" })
            document.getElementById(id).focus();
            openRow(listedPackages[i])
        }
    }
}
/**
 * 
 * @param {*} data - clicked row element
 */
function openRow(data) {
    $(data).find("#cont").slideToggle("slow")
}