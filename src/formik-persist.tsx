import * as React from 'react';
import { FormikProps, connect } from 'formik';
import debounce from 'lodash.debounce';
import omit from 'lodash.omit';
import forIn from 'lodash.forin';
import cloneDeep from 'lodash.clonedeep';
import isEqual from 'react-fast-compare';

function omitDeep(obj: any, fieldToIgnore?: string) {
  forIn(obj, function(value, key) {
    if (typeof value === 'object') {
      omitDeep(value, fieldToIgnore);
    } else if (key === fieldToIgnore) {
      delete obj[key];
    }
  });
}

export interface PersistProps {
  name: string;
  ignoreFields?: string[];
  debounce?: number;
  isSessionStorage?: boolean;
}

class PersistImpl extends React.Component<
  PersistProps & { formik: FormikProps<any> },
  {}
> {
  static defaultProps = {
    debounce: 300,
  };

  saveForm = debounce((data: FormikProps<{}>) => {
    const dataToSave = this.omitIgnoredFields(data);
    if (this.props.isSessionStorage) {
      window.sessionStorage.setItem(
        this.props.name,
        JSON.stringify(dataToSave)
      );
    } else {
      window.localStorage.setItem(this.props.name, JSON.stringify(dataToSave));
    }
  }, this.props.debounce);

  omitIgnoredFields = (data: FormikProps<{}>) => {
    const { ignoreFields } = this.props;
    const { values, touched, errors } = data;

    const valuesDeepCopy = cloneDeep(values);

    // @ts-ignore
    const fieldsToIgnore = [...ignoreFields] || [];
    fieldsToIgnore.map((f: string) =>
      omitDeep(valuesDeepCopy, f.split('.').pop())
    );

    return ignoreFields
      ? {
          ...data,
          values: omit(valuesDeepCopy, ignoreFields),
          touched: omit(touched, ignoreFields),
          errors: omit(errors, ignoreFields),
        }
      : data;
  };

  componentDidUpdate(prevProps: PersistProps & { formik: FormikProps<any> }) {
    if (!isEqual(prevProps.formik, this.props.formik)) {
      this.saveForm(this.props.formik);
    }
  }

  componentDidMount() {
    const maybeState = this.props.isSessionStorage
      ? window.sessionStorage.getItem(this.props.name)
      : window.localStorage.getItem(this.props.name);
    if (maybeState && maybeState !== null) {
      this.props.formik.setFormikState(JSON.parse(maybeState));
    }
  }

  render() {
    return null;
  }
}

export const Persist = connect<PersistProps, any>(PersistImpl);
