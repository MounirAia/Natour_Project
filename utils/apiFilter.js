class APIFilter {
  constructor(parameters) {
    const { queryObj, queryString, maxNumberOfFilterParameters } = parameters;
    this.queryObj = queryObj;
    this.queryString = queryString;
    this.maxNumberOfFilterParameters = maxNumberOfFilterParameters;
  }

  filter() {
    const queryString = { ...this.queryString };

    const excludedQueryParameters = ['sort', 'select', 'page', 'limit'];

    // parameter that the filter method will not treat
    excludedQueryParameters.forEach((queryParameter) => {
      delete queryString[queryParameter];
    });

    // Filter tours query by field values
    const filters = {};
    const keysOfRequestQuery = Object.keys(queryString);
    // check if the query string is not too long
    if (keysOfRequestQuery.length < this.maxNumberOfFilterParameters) {
      // start adding each of the filter to the filters obj
      keysOfRequestQuery.forEach((key) => {
        const specificFilter = queryString[key];
        if (typeof specificFilter === 'object') {
          // filter of the form {<attribute>:{lte:5, <othersubfilter>:<value>}}
          // must be replaced by {<attribute>:{$lte:5,...}}
          const keysOfSpecificFilter = Object.keys(specificFilter);
          keysOfSpecificFilter.forEach((specificFilterKey) => {
            filters[key] = {};
            filters[key][`$${specificFilterKey}`] =
              specificFilter[specificFilterKey];
          });
        } else {
          // filter of the form {<attribute>:<value>}
          filters[key] = specificFilter;
        }
      });
    }

    this.queryObj.find(filters);
    return this;
  }

  sort() {
    // 2) Sort the query
    if (this.queryString.sort) {
      this.queryObj.sort(this.queryString.sort);
    } else {
      this.queryObj.sort({ price: 'desc' });
    }

    return this;
  }

  select() {
    // Selecting the fields you want
    if (this.queryString.select) {
      const selectedFields = this.queryString.select.split(',').join(' ');
      this.queryObj.select(selectedFields);
    } else {
      this.queryObj.select('-__v');
    }
    return this;
  }

  paginate() {
    // Limit the number of field to return
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 100;
    const skip = (page - 1) * limit;
    this.queryObj.skip(skip).limit(limit);
    return this;
  }

  getQueryObject() {
    return this.queryObj;
  }
}

module.exports.APIFilter = APIFilter;
