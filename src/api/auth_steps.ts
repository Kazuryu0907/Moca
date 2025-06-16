import { ErrorHandleType, return_error } from "../common/handle_error";
import { AuthErrorType } from "../common/error_messages";

export interface AuthStepResult {
  success: boolean;
  errorType?: AuthErrorType;
  errorContext?: string;
  data?: any;
}

export abstract class AuthStep {
  abstract readonly stepName: string;
  abstract readonly description: string;
  
  abstract execute(): Promise<AuthStepResult>;
  
  protected createSuccessResult(data?: any): AuthStepResult {
    return { success: true, data };
  }
  
  protected createErrorResult(errorType: AuthErrorType, context?: string): AuthStepResult {
    return { success: false, errorType, errorContext: context };
  }
}

export class AuthFlowManager {
  private steps: AuthStep[] = [];
  private currentStepIndex = 0;
  
  constructor(steps: AuthStep[]) {
    this.steps = steps;
  }
  
  async executeFlow(): Promise<AuthStepResult> {
    for (let i = 0; i < this.steps.length; i++) {
      this.currentStepIndex = i;
      const step = this.steps[i];
      
      console.log(`[AuthFlow] Executing step ${i + 1}/${this.steps.length}: ${step.stepName}`);
      
      const result = await step.execute();
      
      if (!result.success) {
        console.error(`[AuthFlow] Step ${step.stepName} failed:`, result.errorType);
        return result;
      }
      
      console.log(`[AuthFlow] Step ${step.stepName} completed successfully`);
    }
    
    return { success: true };
  }
  
  getCurrentStep(): AuthStep | null {
    return this.steps[this.currentStepIndex] || null;
  }
  
  getProgress(): { current: number; total: number; percentage: number } {
    return {
      current: this.currentStepIndex + 1,
      total: this.steps.length,
      percentage: Math.round(((this.currentStepIndex + 1) / this.steps.length) * 100)
    };
  }
}