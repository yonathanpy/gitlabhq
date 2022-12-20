import { GlDrawer, GlForm, GlFormGroup, GlFormRadioGroup } from '@gitlab/ui';
import { shallowMountExtended } from 'helpers/vue_test_utils_helper';

import AbuseCategorySelector from '~/abuse_reports/components/abuse_category_selector.vue';

jest.mock('~/lib/utils/common_utils', () => ({
  contentTop: jest.fn(),
}));

jest.mock('~/lib/utils/csrf', () => ({ token: 'mock-csrf-token' }));

describe('AbuseCategorySelector', () => {
  let wrapper;

  const ACTION_PATH = '/abuse_reports/add_category';
  const USER_ID = '1';
  const REPORTED_FROM_URL = 'http://example.com';

  const createComponent = (props) => {
    wrapper = shallowMountExtended(AbuseCategorySelector, {
      propsData: {
        ...props,
      },
      provide: {
        formSubmitPath: ACTION_PATH,
        userId: USER_ID,
        reportedFromUrl: REPORTED_FROM_URL,
      },
    });
  };

  beforeEach(() => {
    createComponent({ showDrawer: true });
  });

  afterEach(() => {
    wrapper.destroy();
  });

  const findDrawer = () => wrapper.findComponent(GlDrawer);
  const findTitle = () => wrapper.findByTestId('category-drawer-title');

  const findForm = () => wrapper.findComponent(GlForm);
  const findFormGroup = () => wrapper.findComponent(GlFormGroup);
  const findRadioGroup = () => wrapper.findComponent(GlFormRadioGroup);

  const findCSRFToken = () => findForm().find('input[name="authenticity_token"]');
  const findUserId = () => wrapper.findByTestId('input-user-id');
  const findReferer = () => wrapper.findByTestId('input-referer');

  const findSubmitFormButton = () => wrapper.findByTestId('submit-form-button');

  describe('Drawer', () => {
    it('is open when prop showDrawer = true', () => {
      expect(findDrawer().exists()).toBe(true);
      expect(findDrawer().props('open')).toBe(true);
    });

    it('renders title', () => {
      expect(findTitle().text()).toBe(wrapper.vm.$options.i18n.title);
    });

    it('emits close-drawer event', async () => {
      await findDrawer().vm.$emit('close');

      expect(wrapper.emitted('close-drawer')).toHaveLength(1);
    });

    describe('when props showDrawer = false', () => {
      beforeEach(() => {
        createComponent({ showDrawer: false });
      });

      it('hides the drawer', () => {
        expect(findDrawer().props('open')).toBe(false);
      });
    });
  });

  describe('Select category form', () => {
    it('renders POST form with path', () => {
      expect(findForm().attributes()).toMatchObject({
        method: 'post',
        action: ACTION_PATH,
      });
    });

    it('renders csrf token', () => {
      expect(findCSRFToken().attributes('value')).toBe('mock-csrf-token');
    });

    it('renders label', () => {
      expect(findFormGroup().exists()).toBe(true);
      expect(findFormGroup().attributes('label')).toBe(wrapper.vm.$options.i18n.label);
    });

    it('renders radio group', () => {
      expect(findRadioGroup().exists()).toBe(true);
      expect(findRadioGroup().props('options')).toEqual(wrapper.vm.$options.categoryOptions);
      expect(findRadioGroup().attributes('name')).toBe('abuse_report[category]');
      expect(findRadioGroup().attributes('required')).not.toBeUndefined();
    });

    it('renders userId as a hidden fields', () => {
      expect(findUserId().attributes()).toMatchObject({
        type: 'hidden',
        name: 'user_id',
        value: USER_ID,
      });
    });

    it('renders referer as a hidden fields', () => {
      expect(findReferer().attributes()).toMatchObject({
        type: 'hidden',
        name: 'ref_url',
        value: REPORTED_FROM_URL,
      });
    });

    it('renders submit button', () => {
      expect(findSubmitFormButton().exists()).toBe(true);
      expect(findSubmitFormButton().text()).toBe(wrapper.vm.$options.i18n.next);
    });
  });
});
