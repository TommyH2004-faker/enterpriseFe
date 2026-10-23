import type { FormEvent } from 'react'
import {
  CButton,
  CCol,
  CForm,
  CFormInput,
  CFormSelect,
  CRow,
  CSpinner,
} from '@coreui/react'
import type { UpdateMyProfileRequest, UserProfile } from 'src/types/profile'

export interface ProfileFormValues {
  username: string
  email: string
  firstName: string
  lastName: string
  phoneNumber: string
  gender: string
  dateOfBirth: string
}

interface ProfileFormProps {
  values: ProfileFormValues
  initialValues: ProfileFormValues // dữ liệu đã lưu, dùng để biết form có thay đổi không
  saving: boolean
  onChange: (values: ProfileFormValues) => void
  onSubmit: (data: UpdateMyProfileRequest) => Promise<void>
}

function toDateInput(value: string | null): string {
  return value ? value.slice(0, 10) : ''
}

// Enum Gender ở backend: Unknown = 0, Male = 1, Female = 2, Other = 3.
// API dùng số; hàm này cũng chấp nhận tên chữ ("Male") để không lỗi nếu GET còn trả chữ.
const GENDER_BY_NAME: Record<string, number> = { Unknown: 0, Male: 1, Female: 2, Other: 3 }

function toGenderValue(gender: number | string | null | undefined): string {
  if (typeof gender === 'number') return String(gender)
  if (!gender) return '0'
  if (/^\d+$/.test(gender)) return gender
  return String(GENDER_BY_NAME[gender] ?? 0)
}

export function toProfileFormValues(user: UserProfile): ProfileFormValues {
  return {
    username: user.username ?? '',
    email: user.email ?? '',
    firstName: user.firstName ?? '',
    lastName: user.lastName ?? '',
    phoneNumber: user.phoneNumber ?? '',
    gender: toGenderValue(user.gender),
    dateOfBirth: toDateInput(user.dateOfBirth),
  }
}

// Username là tên đăng nhập nên bị khóa, không nằm trong danh sách có thể sửa.
const REQUIRED: (keyof ProfileFormValues)[] = ['email', 'firstName', 'lastName']

export default function ProfileForm({
  values,
  initialValues,
  saving,
  onChange,
  onSubmit,
}: ProfileFormProps) {
  const setField = (field: keyof ProfileFormValues, value: string) => {
    onChange({ ...values, [field]: value })
  }

  const dirty = (Object.keys(values) as (keyof ProfileFormValues)[]).some(
    (k) => values[k] !== initialValues[k],
  )

  const isEmpty = (k: keyof ProfileFormValues) =>
    REQUIRED.includes(k) && !values[k].trim()

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    await onSubmit({
      username: initialValues.username, // luôn giữ nguyên, backend cũng không cho đổi
      email: values.email.trim(),
      firstName: values.firstName.trim(),
      lastName: values.lastName.trim(),
      phoneNumber: values.phoneNumber.trim() || null,
      gender: Number(values.gender) || 0, // gửi số theo enum Gender
      dateOfBirth: values.dateOfBirth || null,
    })
  }

  return (
    <section>
      <div className="profile-section-title">
        <h6>Thông tin cá nhân</h6>
        <p className="text-body-secondary mb-0">
          Cập nhật thông tin liên hệ của bạn. Tên đăng nhập không thể thay đổi.
        </p>
      </div>

      <CForm onSubmit={handleSubmit} noValidate>
        <CRow className="g-3">
          <CCol md={6}>
            <CFormInput
              label="Username"
              value={values.username}
              disabled
              readOnly
              text="Dùng để đăng nhập, không thể thay đổi."
              autoComplete="username"
            />
          </CCol>

          <CCol md={6}>
            <CFormInput
              label="Email"
              type="email"
              value={values.email}
              onChange={(e) => setField('email', e.target.value)}
              invalid={isEmpty('email')}
              feedbackInvalid="Email không được để trống."
              maxLength={254}
              autoComplete="email"
            />
          </CCol>

          <CCol md={6}>
            <CFormInput
              label="Họ"
              value={values.firstName}
              onChange={(e) => setField('firstName', e.target.value)}
              invalid={isEmpty('firstName')}
              feedbackInvalid="Họ không được để trống."
              maxLength={100}
            />
          </CCol>

          <CCol md={6}>
            <CFormInput
              label="Tên"
              value={values.lastName}
              onChange={(e) => setField('lastName', e.target.value)}
              invalid={isEmpty('lastName')}
              feedbackInvalid="Tên không được để trống."
              maxLength={100}
            />
          </CCol>

          <CCol md={6}>
            <CFormInput
              label="Số điện thoại"
              type="tel"
              value={values.phoneNumber}
              onChange={(e) => setField('phoneNumber', e.target.value)}
              maxLength={30}
              autoComplete="tel"
            />
          </CCol>

          <CCol md={3}>
            <CFormSelect
              label="Giới tính"
              value={values.gender}
              onChange={(e) => setField('gender', e.target.value)}
              options={[
                { label: 'Chưa chọn', value: '0' },
                { label: 'Nam', value: '1' },
                { label: 'Nữ', value: '2' },
                { label: 'Khác', value: '3' },
              ]}
            />
          </CCol>

          <CCol md={3}>
            <CFormInput
              label="Ngày sinh"
              type="date"
              value={values.dateOfBirth}
              onChange={(e) => setField('dateOfBirth', e.target.value)}
            />
          </CCol>
        </CRow>

        {dirty && (
          <div className="profile-savebar" role="status">
            <span className="profile-savebar-text">Bạn có thay đổi chưa lưu</span>

            <div className="profile-savebar-actions">
              <CButton
                color="link"
                type="button"
                className="profile-undo-btn"
                disabled={saving}
                onClick={() => onChange(initialValues)}
              >
                Hoàn tác
              </CButton>

              <CButton
                color="primary"
                type="submit"
                className="profile-save-btn"
                disabled={saving || REQUIRED.some(isEmpty)}
              >
                {saving ? (
                  <>
                    <CSpinner size="sm" className="me-2" />
                    Đang lưu
                  </>
                ) : (
                  'Lưu thay đổi'
                )}
              </CButton>
            </div>
          </div>
        )}
      </CForm>
    </section>
  )
}