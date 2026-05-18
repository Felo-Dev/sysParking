import { Notify, Report, Confirm, Loading } from 'notiflix';

Notify.init({
  position: 'right-top',
  distance: '80px',
  borderRadius: '12px',
  clickToClose: true,
  showOnlyTheLastOne: false,
  success: { background: '#059669', textColor: '#fff', notiflixIconColor: '#fff' },
  failure: { background: '#dc2626', textColor: '#fff', notiflixIconColor: '#fff' },
  warning: { background: '#d97706', textColor: '#fff', notiflixIconColor: '#fff' },
  info: { background: '#2563eb', textColor: '#fff', notiflixIconColor: '#fff' },
});

Confirm.init({
  borderRadius: '16px',
  titleColor: '#111827',
  okButtonBackground: '#059669',
  cancelButtonBackground: '#e5e7eb',
  cancelButtonColor: '#374151',
  fontFamily: 'inherit',
});

export const notify = {
  success: (msg) => Notify.success(msg),
  failure: (msg) => Notify.failure(msg),
  warning: (msg) => Notify.warning(msg),
  info: (msg) => Notify.info(msg),
  confirm: (title, message, okText, cancelText, onOk, onCancel) =>
    Confirm.show(title, message, okText, cancelText, onOk, onCancel),
  loading: () => Loading.hourglass(),
  dismissLoading: () => Loading.remove(),
};

export default notify;
