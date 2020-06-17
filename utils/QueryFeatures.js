class QueryFeatures {
  constructor(query, queryStr) {
    this.query = query;
    this.queryStr = queryStr;
  }

  filter() {
    let queryObj = { ...this.queryStr };
    // Exclude query keywords
    const keywords = ['fields', 'sort', 'page', 'limit'];
    keywords.forEach((keyword) => delete queryObj[keyword]);

    // Extract and use query operators
    queryObj = JSON.parse(
      JSON.stringify(queryObj).replace(
        /\b(gt|gte|lt|lte|in)\b/g,
        (v) => `$${v}`
      )
    );

    this.query = this.query.find(queryObj);

    return this;
  }

  select() {
    // Select fields
    if (this.queryStr.fields) {
      const fields = this.queryStr.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    }

    return this;
  }

  sort() {
    // Sort
    if (this.queryStr.sort) {
      const sort = this.queryStr.sort.split(',').join(' ');
      this.query = this.query.sort(sort);
    } else {
      this.query = this.query.sort('-createdAt');
    }
    return this;
  }

  paginate() {
    // Pagination
    const page = parseInt(this.queryStr.page, 10) || 1;
    const limit = parseInt(this.queryStr.limit, 10) || 25;
    const skip = (page - 1) * limit;
    this.query = this.query.skip(skip).limit(limit);

    return this;
  }
}

module.exports = QueryFeatures;
