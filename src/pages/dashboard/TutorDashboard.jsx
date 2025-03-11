import React from 'react'
import BreadCrumps from '../../components/BreadCrumps'
import { User } from 'lucide-react';
import UsersTable from '../tutor-interfaces/UsersTable';
import LayoutStudent from './LayoutStudent';

function TutorDashboard(){
    return (
        <div>
          <LayoutStudent >
          <UsersTable />
          </LayoutStudent>
        </div>
      );

}
export default TutorDashboard;
