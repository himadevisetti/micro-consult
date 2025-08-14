import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import StandardRetainerFlow from '../components/FormFlows/StandardRetainerFlow'
import IPCounselForm from '../components/FormFlows/IPCounselForm'
import CustomUploadForm from '../components/FormFlows/CustomUploadForm'

const FormRouterPage = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const queryParams = new URLSearchParams(location.search)
  const template = queryParams.get('template')
  const [isValid, setIsValid] = useState(false)

  useEffect(() => {
    if (!template) return

    const validTemplates = ['standard-retainer', 'ip-counsel-retainer', 'custom-upload']
    const normalized = template.toLowerCase()
    setIsValid(validTemplates.includes(normalized))

    if (!validTemplates.includes(normalized)) {
      navigate('/')
    }
  }, [template, navigate])

  const renderForm = () => {
    switch (template?.toLowerCase()) {
      case 'standard-retainer':
        return <StandardRetainerFlow />
      case 'ip-counsel-retainer':
        return <IPCounselForm />
      case 'custom-upload':
        return <CustomUploadForm />
      default:
        return null
    }
  }

  return (
    <div className="form-section">
      {isValid ? renderForm() : <p>🔄 Loading builder...</p>}
    </div>
  )
}

export default FormRouterPage
