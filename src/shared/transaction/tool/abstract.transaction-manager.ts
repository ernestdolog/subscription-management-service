/**
 * The Abstract TransactionManager
 * ===============================
 * Provides transactions for Application layer
 * and context for the Infrastructure layer
 */
export abstract class AbstractTransactionManager<
    InfrastructureType = 'TypeOrm',
    ContextType = unknown,
> {
    transaction: <ReturnType>(
        callback: (context: ContextType) => Promise<ReturnType>,
    ) => Promise<ReturnType>;
    context: ContextType;
    abstract infrastructure: InfrastructureType;
}
