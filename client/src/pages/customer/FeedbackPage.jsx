import { CustomerLayout } from '../../components/layout';
import { FeedbackForm } from '../../components/forms';
import { useParams } from 'react-router-dom';

export default function FeedbackPage() {
  const { id } = useParams();

  return (
    <CustomerLayout>
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold">Provide Feedback</h1>
          <p className="text-muted-foreground mt-1">
            Your feedback helps us improve our service. Please rate your experience and provide any additional comments.
          </p>
        </div>

        <FeedbackForm ticketId={id} />
      </div>
    </CustomerLayout>
  );
} 