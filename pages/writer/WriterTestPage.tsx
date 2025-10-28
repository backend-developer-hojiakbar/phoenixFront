import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useLanguage } from '../../hooks/useLanguage';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { useNavigate } from 'react-router-dom';
import { 
  UserIcon, 
  DocumentTextIcon, 
  BookOpenIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';

const WriterTestPage: React.FC = () => {
  const { user, logout } = useAuth();
  const { translate } = useLanguage();
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-accent-sky flex items-center">
          <UserIcon className="h-8 w-8 mr-2" />
          Writer Test Page
        </h1>
        <Button 
          variant="secondary"
          onClick={() => navigate('/writer/dashboard')}
          leftIcon={<ArrowLeftIcon className="h-4 w-4"/>}
        >
          Back to Dashboard
        </Button>
      </div>
      
      <Card title="Writer Account Information" icon={<UserIcon className="h-6 w-6 text-accent-sky"/>}>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-light-text mb-2">Name</h3>
              <p className="text-medium-text">{user?.name} {user?.surname}</p>
            </div>
            <div>
              <h3 className="font-medium text-light-text mb-2">Role</h3>
              <p className="text-medium-text">Writer</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-light-text mb-2">Phone</h3>
              <p className="text-medium-text">{user?.phone}</p>
            </div>
            <div>
              <h3 className="font-medium text-light-text mb-2">User ID</h3>
              <p className="text-medium-text">{user?.id}</p>
            </div>
          </div>
          
          <div className="pt-4">
            <Button
              variant="danger"
              onClick={logout}
              leftIcon={<UserIcon className="h-4 w-4" />}
            >
              Logout
            </Button>
          </div>
        </div>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card title="Submit Article" icon={<DocumentTextIcon className="h-6 w-6 text-accent-sky"/>}>
          <p className="text-medium-text mb-4">Submit a new article for review.</p>
          <Button 
            fullWidth 
            onClick={() => navigate('/writer/submit-article')}
            leftIcon={<DocumentTextIcon className="h-4 w-4" />}
          >
            Go to Submit Article
          </Button>
        </Card>
        
        <Card title="My Articles" icon={<BookOpenIcon className="h-6 w-6 text-accent-sky"/>}>
          <p className="text-medium-text mb-4">View and manage your submitted articles.</p>
          <Button 
            fullWidth 
            onClick={() => navigate('/writer/my-articles')}
            leftIcon={<BookOpenIcon className="h-4 w-4" />}
          >
            View My Articles
          </Button>
        </Card>
        
        <Card title="Profile" icon={<UserIcon className="h-6 w-6 text-accent-sky"/>}>
          <p className="text-medium-text mb-4">Manage your profile information.</p>
          <Button 
            fullWidth 
            onClick={() => navigate('/writer/profile')}
            leftIcon={<UserIcon className="h-4 w-4" />}
          >
            View Profile
          </Button>
        </Card>
      </div>
    </div>
  );
};

export default WriterTestPage;