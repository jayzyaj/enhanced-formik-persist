import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Persist } from '../src/formik-persist';
import { Formik, FormikProps, Form } from 'formik';

// tslint:disable-next-line:no-empty
const noop = () => {};

describe('Formik Persist', () => {
  it('attempts to rehydrate on mount', () => {
    let node = document.createElement('div');
    (window as any).localStorage = {
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn(),
    };
    let injected: any;

    ReactDOM.render(
      <Formik
        initialValues={{ name: 'jared' }}
        onSubmit={noop}
        render={(props: FormikProps<{ name: string }>) => {
          injected = props;
          return (
            <div>
              <Persist name="signup" debounce={0} />
            </div>
          );
        }}
      />,
      node
    );
    expect(window.localStorage.getItem).toHaveBeenCalled();
    injected.setValues({ name: 'ian' });
    expect(injected.values.name).toEqual('ian');
  });

  it('attempts to rehydrate on mount if session storage is true on props', () => {
    let node = document.createElement('div');
    (window as any).sessionStorage = {
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn(),
    };
    let injected: any;

    ReactDOM.render(
      <Formik
        initialValues={{ name: 'Anuj Sachan' }}
        onSubmit={noop}
        render={(props: FormikProps<{ name: string }>) => {
          injected = props;
          return (
            <div>
              <Persist name="signup" debounce={0} isSessionStorage />
            </div>
          );
        }}
      />,
      node
    );
    expect(window.sessionStorage.getItem).toHaveBeenCalled();
    injected.setValues({ name: 'Anuj' });
    expect(injected.values.name).toEqual('Anuj');
  });

  it('should omits complicated nested objects', () => {
    let node = document.createElement('div');
    jest.useFakeTimers();
    let state = null;
    let setItem = (key: string, value: any) => (state = value);
    (window as any).localStorage = {
      getItem: jest.fn(),
      setItem,
      removeItem: jest.fn(),
    };
    let injected: any;
    ReactDOM.render(
      <Formik
        initialValues={{ name: 'Anuj Sachan' }}
        onSubmit={noop}
        render={(
          props: FormikProps<{ name: string; person: { gender: string } }>
        ) => {
          injected = props;
          return (
            <div>
              <Persist
                name="signup"
                debounce={0}
                ignoreFields={[
                  'first_name',
                  'person.gender',
                  'number',
                  'phones',
                ]}
              />
            </div>
          );
        }}
      />,
      node
    );
    injected.setValues({
      name: 'ciaran',
      person: {
        gender: 'M',
        dateOfBirth: '2020-01-01',
        passports: [{ number: 123 }, { number: 456 }],
        phones: [1423, 1515],
      },
    });
    jest.runAllTimers();
    expect(JSON.parse(state).values).toEqual({
      name: 'ciaran',
      person: {
        dateOfBirth: '2020-01-01',
        passports: [{}, {}],
      },
    });
  });

  it('should omit array of objects when ignored', () => {
    let node = document.createElement('div');
    jest.useFakeTimers();
    let state = null;
    let setItem = (key: string, value: any) => (state = value);
    (window as any).localStorage = {
      getItem: jest.fn(),
      setItem,
      removeItem: jest.fn(),
    };
    let injected: any;
    ReactDOM.render(
      <Formik
        // initialValues={{ name: 'Anuj Sachan' }}
        onSubmit={noop}
        render={(
          props: FormikProps<{ person_profiles: [{ name: string }] }>
        ) => {
          injected = props;
          return (
            <div>
              <Persist
                name="signup"
                debounce={0}
                ignoreFields={['person_profiles']}
              />
            </div>
          );
        }}
      />,
      node
    );
    injected.setValues({
      person_profiles: [{ name: 'Hehe' }],
    });
    jest.runAllTimers();
    expect(JSON.parse(state).values).toEqual({});
  });

  it('should not omit array of objects when no ignore props', () => {
    let node = document.createElement('div');
    jest.useFakeTimers();
    let state = null;
    let setItem = (key: string, value: any) => (state = value);
    (window as any).localStorage = {
      getItem: jest.fn(),
      setItem,
      removeItem: jest.fn(),
    };
    let injected: any;
    ReactDOM.render(
      <Formik
        // initialValues={{ persons: [{ name: 'Anuj Sachan'}] }}
        onSubmit={noop}
        render={(props: FormikProps<{ persons: [{ name: string }] }>) => {
          injected = props;
          return (
            <div>
              <Persist name="signup" debounce={0} />
            </div>
          );
        }}
      />,
      node
    );
    injected.setValues({
      persons: [{ name: 'Hehe' }],
    });
    jest.runAllTimers();
    expect(JSON.parse(state).values).toEqual({
      persons: [{ name: 'Hehe' }],
    });
  });
});
