import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import PageHeader from '@/components/ui/PageHeader';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import { Card, CardBody } from '@/components/ui/Card';
import { SkeletonCard } from '@/components/ui/Skeleton';
import DepartmentCard from '@/components/citizen/DepartmentCard';
import ServiceCard from '@/components/citizen/ServiceCard';
import { useDepartments, useServicesByDepartment, useServiceAvailability } from '@/hooks/useDepartments';
import { useCreateToken } from '@/hooks/useTokens';
import { PRIORITY_LEVELS, PRIORITY_LABELS } from '@/constants/tokenStatus';

const STEPS = ['Department', 'Service', 'Priority', 'Review'];

export default function BookTokenPage() {
  const navigate = useNavigate();
  const { data: departments, isLoading: isLoadingDepartments } = useDepartments();
  const createTokenMutation = useCreateToken();

  const [step, setStep] = useState(0);
  const [department, setDepartment] = useState(null);
  const [service, setService] = useState(null);
  const [priorityType, setPriorityType] = useState(PRIORITY_LEVELS.NORMAL);

  const { data: services, isLoading: isLoadingServices } = useServicesByDepartment(department?._id);
  const { data: availability } = useServiceAvailability(service?._id);

  const goNext = () => setStep((s) => Math.min(s + 1, STEPS.length - 1));
  const goBack = () => setStep((s) => Math.max(s - 1, 0));

  const canProceed = {
    0: Boolean(department),
    1: Boolean(service),
    2: !availability || !availability.isFull,
    3: true,
  }[step];

  const handleConfirm = async () => {
    try {
      const token = await createTokenMutation.mutateAsync({
        departmentId: department._id,
        serviceId: service._id,
        priorityType,
      });
      navigate(`/citizen/tokens/${token._id}/confirmation`);
    } catch {
      // Error toast is already shown by useCreateToken's onError handler.
    }
  };

  return (
    <div>
      <PageHeader
        title="Book a Token"
        breadcrumbItems={[{ label: 'Book Token' }]}
        description="Follow the steps to reserve your spot in the queue."
      />

      <Stepper steps={STEPS} current={step} />

      <Card className="mt-6">
        <CardBody>
          {step === 0 && (
            <StepBlock title="Select a department">
              {isLoadingDepartments ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  <SkeletonCard />
                  <SkeletonCard />
                </div>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {departments?.map((dept) => (
                    <DepartmentCard
                      key={dept._id}
                      department={dept}
                      selected={department?._id === dept._id}
                      onSelect={(d) => {
                        setDepartment(d);
                        setService(null);
                      }}
                    />
                  ))}
                </div>
              )}
            </StepBlock>
          )}

          {step === 1 && department && (
            <StepBlock title={`Select a service in ${department.departmentName}`}>
              {isLoadingServices ? (
                <div className="space-y-3">
                  <SkeletonCard />
                  <SkeletonCard />
                </div>
              ) : (
                <div className="space-y-3">
                  {services?.map((svc) => (
                    <ServiceCard
                      key={svc._id}
                      service={svc}
                      selected={service?._id === svc._id}
                      onSelect={setService}
                    />
                  ))}
                </div>
              )}
            </StepBlock>
          )}

          {step === 2 && (
            <StepBlock title="Confirm priority category">
              {availability && (
                <p
                  className={`mb-4 text-sm font-medium ${
                    availability.isFull ? 'text-danger-600' : 'text-gray-500 dark:text-gray-400'
                  }`}
                >
                  {availability.isFull
                    ? "Today's token limit for this service has been reached. Please try again tomorrow."
                    : `${availability.remaining} of ${availability.dailyTokenLimit} tokens remaining today for this service.`}
                </p>
              )}
              <div className="max-w-xs">
                <Select
                  label="Priority category"
                  value={priorityType}
                  onChange={(e) => setPriorityType(e.target.value)}
                  hint="Helps us serve those with urgent needs fairly"
                >
                  {Object.values(PRIORITY_LEVELS).map((level) => (
                    <option key={level} value={level}>
                      {PRIORITY_LABELS[level]}
                    </option>
                  ))}
                </Select>
              </div>
              <p className="mt-4 text-xs text-gray-400 dark:text-gray-500">
                This is a live queue system — there are no fixed appointment time slots. Your token
                joins the real-time queue immediately and your position/estimated wait update as the
                queue moves.
              </p>
            </StepBlock>
          )}

          {step === 3 && (
            <StepBlock title="Review & confirm">
              <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <ReviewItem label="Department" value={department?.departmentName} />
                <ReviewItem label="Service" value={service?.serviceName} />
                <ReviewItem label="Priority" value={PRIORITY_LABELS[priorityType]} />
                <ReviewItem label="Avg. Service Duration" value={`${service?.averageServiceDuration} min`} />
              </dl>
            </StepBlock>
          )}

          <div className="mt-8 flex justify-between border-t border-gray-100 pt-5 dark:border-gray-700">
            <Button variant="secondary" onClick={goBack} disabled={step === 0}>
              Back
            </Button>
            {step < STEPS.length - 1 ? (
              <Button onClick={goNext} disabled={!canProceed}>
                Continue
              </Button>
            ) : (
              <Button onClick={handleConfirm} isLoading={createTokenMutation.isPending}>
                Confirm Booking
              </Button>
            )}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

function Stepper({ steps, current }) {
  return (
    <ol className="flex items-center gap-2 sm:gap-4">
      {steps.map((label, idx) => (
        <li key={label} className="flex flex-1 items-center gap-2">
          <div
            className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
              idx <= current
                ? 'bg-primary-600 text-white'
                : 'bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
            }`}
          >
            {idx + 1}
          </div>
          <span
            className={`hidden text-sm font-medium sm:block ${
              idx <= current ? 'text-gray-900 dark:text-gray-100' : 'text-gray-400'
            }`}
          >
            {label}
          </span>
          {idx < steps.length - 1 && <div className="h-px flex-1 bg-gray-200 dark:bg-gray-700" />}
        </li>
      ))}
    </ol>
  );
}

function StepBlock({ title, children }) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
      <h3 className="mb-4 text-base font-semibold text-gray-900 dark:text-gray-50">{title}</h3>
      {children}
    </motion.div>
  );
}

function ReviewItem({ label, value }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-gray-400">{label}</dt>
      <dd className="mt-1 text-sm font-medium text-gray-900 dark:text-gray-100">{value || '-'}</dd>
    </div>
  );
}
