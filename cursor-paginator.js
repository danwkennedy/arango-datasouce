const { aql } = require('arangojs');

module.exports = class CursorPaginator {
  constructor(sortField) {
    this.sortField = sortField;
  }

  paginate(query, limit, after = '', before = '') {
    const afterFilter = this.getAfter(after);
    const beforeFilter = this.getBefore(before);

    return aql`
      let records = (${query})

      LET total = LENGTH(records)
      LET first = FIRST(records)[${this.sortField}]
      LET last = LAST(records)[${this.sortField}]

      LET output = (FOR record IN records
        ${afterFilter}
        ${beforeFilter}
        LIMIT ${limit}
        return record
      )

      RETURN { records: output, pagination: {total: total, first: first, last: last } }
    `;
  }

  getAfter(after) {
    if (!after) {
      return undefined;
    }

    return aql`FILTER record[${
      this.sortField
    }] > ${CursorPaginator.valueFromCursor(after)}`;
  }

  getBefore(before) {
    if (!before) {
      return undefined;
    }

    return aql`FILTER record[${
      this.sortField
    }] < ${CursorPaginator.valueFromCursor(before)}`;
  }

  generatePageInfo(first, last, values) {
    return {
      startCursor: this.toCursor(first),
      endCursor: this.toCursor(last),
      hasNextPage:
        !!first && values.length && values[values.length - 1] !== last,
      hasPreviousPage: !!last && values.length && values[0] !== first
    };
  }

  static cursorFromString(cursor) {
    return JSON.parse(Buffer.from(cursor, 'base64').toString());
  }

  static valueFromCursor(cursor) {
    const { value } = this.cursorFromString(cursor);
    return value;
  }

  static fieldFromCursor(cursor) {
    const { field } = this.cursorFromString(cursor);
    return field;
  }

  toCursor(value) {
    const cursorString = JSON.stringify({
      field: this.sortField,
      value: value
    });

    return Buffer.from(cursorString).toString('base64');
  }
};
