import * as React from 'react';
import { FormikProps, connect } from 'formik';
import debounce from 'lodash.debounce';
import omit from 'lodash.omit';
import forIn from 'lodash.forin';
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

  /**
   * 
   * @param data 
   * 
   * 1. Omit data by recursively looking into the object and omit properties inclued in the list of ignored fields
   */

  omitIgnoredFields = (data: FormikProps<{}>) => {
    const { ignoreFields } = this.props;
    const { values, touched, errors } = data;

    // @ts-ignore
    const copy = [...ignoreFields] || [];
    copy.map((f: string) => omitDeep(values, f.split('.').pop()));

    // const ignored = [...ignoreFields || []].map((f: string) => {
    //   const val = get({ ...values }, f);
    //   console.log('val:', val);
    //   return val;
    // });
    // console.log('ignored:', ignored);

    // console.log(values);

    // const arr = [...ignoreFields || []];
    // const obj: any = {};
    // // const toIgnore = arr.map((f: any) => f.split('.').reduce((o: string, i: any) => o[i], obj));
    // const toIgnore = arr.map((f: string) => f.split('.'));
    // console.log('toIgnore:', toIgnore);
    // console.log('obj:', obj);

    return ignoreFields
      ? {
          ...data,
          values: omit(values, ignoreFields),
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
