import styled from 'styled-components';
import Button from 'components/Button';

export default ({ onClick, children, disabled, loading }) => {

  return (
    <CreatePrivateAccountButton onClick={onClick} data-ga-id="create-private-account-home" disabled={disabled} loading={loading}>
      {children}
    </CreatePrivateAccountButton>
  );
}
const CreatePrivateAccountButton = styled(Button)`
  background: ${props => props.theme.color.telosGradientSoft};
  color: rgb(149 126 223 / 90%);
  border: 1px solid rgb(149 126 223 / 40%);
  padding: 16px;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: ${props => props.theme.color.telosGradient};
    color: ${props => props.theme.color.white};
    transition: all 0.3s ease;
    transform: scale(1.05);
    box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.1);
  }
`;