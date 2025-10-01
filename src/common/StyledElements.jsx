import { styled } from '@mui/material/styles';
import Button from '@mui/material/Button';


export const StyledButton = styled(Button)(
    ({ theme }) => ({
        backgroundColor: 'rgb(0, 120, 201)',
        color: 'white',

        '&:hover': {
            backgroundColor: 'rgb(0, 89, 148)',
        },
        
        '&.Mui-disabled': {
            backgroundColor: 'lightgray',
            color: 'darkgray',
            cursor: 'not-allowed',
        }
  })
);