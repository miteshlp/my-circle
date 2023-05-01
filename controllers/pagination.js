module.exports = (totalRecords , currentPage ,row) => {
    const obj = {
        totalpage : Math.ceil(totalRecords / row),
        currentPage : currentPage,
        previousePage : currentPage - 1,
        nextPage : currentPage +1,
        pageShow : 3
    }
    return obj;
}
